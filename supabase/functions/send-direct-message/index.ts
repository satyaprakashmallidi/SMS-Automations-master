import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { sendTelnyxMessage } from '../send-campaign/telnyxSendMessage.ts'
import { fetchTelnyxStatusWithRetry } from '../send-campaign/telnyxFetchStatus.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') ?? ''

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase env vars for send-direct-message function')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
})

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DIRECT_MESSAGE_CAMPAIGN_ID = 'direct-message'

interface StatusEvent {
  value: string
  source: string
  checkedAt: string
  classification?: string
  raw?: unknown
}

interface MessageStatusDetails {
  provider: string
  providerMessageId?: string | null
  events: StatusEvent[]
}

const resolveStatusFromClassification = (
  classification: string | undefined | null,
  fallback: string
): string => {
  if (!classification) return fallback
  const normalized = classification.toLowerCase()
  if (normalized === 'success') return 'delivered'
  if (normalized === 'failed') return 'failed'
  if (normalized === 'queued') return 'queued'
  if (normalized === 'uncertain') return 'uncertain'
  return fallback
}

const safeString = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  return String(value)
}

const getConversationCustomerId = (customer: any): string | null => {
  const rawId =
    customer?.conversationCustomerId ??
    customer?.id ??
    customer?.customer_id ??
    customer?.customerId

  if (rawId === undefined || rawId === null) return null
  return String(rawId)
}

const renderPersonalizedMessage = (baseText: string, customer: any, settings?: any): string => {
  if (!baseText) return baseText

  const replacements: Record<string, string> = {
    name: safeString(customer?.name),
    email: safeString(customer?.email),
    phone: safeString(
      customer?.phone ||
        customer?.phone_number ||
        customer?.phoneNumber
    ),
    status: safeString(customer?.status),
    type: safeString(customer?.type),
    address: safeString(customer?.address),
    'last service': safeString(customer?.lastService || customer?.last_service),
    'total spent': safeString(customer?.totalSpent || customer?.total_spent),
  }

  if (settings) {
    const profileFirst = safeString(settings.first_name)
    const profileLast = safeString(settings.last_name)
    const profileFullName =
      `${profileFirst} ${profileLast}`.trim() || profileFirst || profileLast

    const profileReplacements: Record<string, string> = {
      'profile name': profileFullName,
      'profile first name': profileFirst,
      'profile last name': profileLast,
      'profile email': safeString(settings.email),
      'profile phone': safeString(settings.phone),
      'company name': safeString(settings.company_name),
      'company address': safeString(settings.business_address),
      'company phone': safeString(settings.business_phone),
      'company website': safeString(settings.website),
      'sender name': safeString(settings.sender_name),
    }

    for (const [key, value] of Object.entries(profileReplacements)) {
      if (value) {
        replacements[key] = value
      }
    }
  }

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  let text = baseText
  for (const [key, value] of Object.entries(replacements)) {
    const pattern = new RegExp(`{{\\s*${escapeRegExp(key)}\\s*}}`, 'gi')
    text = text.replace(pattern, value)
  }

  return text
}

const recordConversationMessage = async (params: {
  userId: string
  customer: any
  messageText: string
  timestamp: string
  status: string
  providerMessageId?: string | null
  statusDetails?: MessageStatusDetails | null
}) => {
  const {
    userId,
    customer,
    messageText,
    timestamp,
    status,
    providerMessageId,
    statusDetails,
  } = params

  const conversationCustomerId = getConversationCustomerId(customer)
  if (!userId || !conversationCustomerId) return

  try {
    const { data: existingRow, error } = await supabaseAdmin
      .from('customer_conversations')
      .select('id,messages,unread_count,customer_name,status')
      .eq('user_id', userId)
      .eq('customer_id', conversationCustomerId)
      .maybeSingle()

    if (error) throw error

    const latestStatus =
      statusDetails?.events?.[statusDetails.events.length - 1]?.value || status
    const normalizedStatus = latestStatus ? String(latestStatus).toLowerCase() : ''

    const messageEntry: Record<string, any> = {
      id: crypto.randomUUID(),
      direction: 'outbound',
      content: messageText || '',
      status: normalizedStatus || 'unknown',
      campaignId: DIRECT_MESSAGE_CAMPAIGN_ID,
      providerMessageId: providerMessageId || null,
      timestamp: timestamp || new Date().toISOString(),
    }

    if (statusDetails && statusDetails.events?.length) {
      messageEntry.statusDetails = statusDetails
    }

    const existingMessages = Array.isArray(existingRow?.messages) ? existingRow.messages : []
    const nextMessages = [...existingMessages, messageEntry]

    const payload = {
      customer_name: customer?.name || existingRow?.customer_name || '',
      messages: nextMessages,
      last_message: messageEntry.content,
      last_message_at: messageEntry.timestamp,
      unread_count: 0,
      status: normalizedStatus || existingRow?.status || 'sent',
    }

    if (existingRow?.id) {
      await supabaseAdmin
        .from('customer_conversations')
        .update(payload)
        .eq('id', existingRow.id)
    } else {
      await supabaseAdmin.from('customer_conversations').insert({
        user_id: userId,
        customer_id: conversationCustomerId,
        ...payload,
      })
    }
  } catch (error) {
    console.error('send-direct-message: failed to record conversation entry', {
      userId,
      customerId: conversationCustomerId,
      error,
    })
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const userId = body?.userId
    const customer = body?.customer
    const baseMessage = body?.message

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!customer) {
      return new Response(JSON.stringify({ error: 'Customer is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!baseMessage || !String(baseMessage).trim()) {
      return new Response(JSON.stringify({ error: 'Message cannot be empty' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const destinationPhone =
      customer?.phone ||
      customer?.phone_number ||
      customer?.phoneNumber

    if (!destinationPhone) {
      return new Response(JSON.stringify({ error: 'Customer phone number is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let messageText = String(baseMessage)

    let settingsRow: any = null
    try {
      const { data, error } = await supabaseAdmin
        .from('settings')
        .select(
          'first_name,last_name,email,phone,company_name,business_address,business_phone,website,sender_name,default_signature'
        )
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        console.error('send-direct-message: failed to load settings', { userId, error })
      } else if (data) {
        settingsRow = data
      }
    } catch (settingsError) {
      console.error('send-direct-message: unexpected error loading settings', settingsError)
    }

    const personalizedText = renderPersonalizedMessage(messageText, customer, settingsRow)
    const sendTimestamp = new Date().toISOString()

    const sendResult = await sendTelnyxMessage(destinationPhone, personalizedText)
    const statusEvents: StatusEvent[] = []

    statusEvents.push({
      value: sendResult.initialStatus || 'queued',
      source: 'send-response',
      checkedAt: sendTimestamp,
      raw: sendResult.rawResponse ?? null,
    })

    let finalStatus = sendResult.initialStatus || 'queued'
    let statusDetails: MessageStatusDetails | null = {
      provider: 'telnyx',
      providerMessageId: sendResult.messageId,
      events: [...statusEvents],
    }

    try {
      const statusResult = await fetchTelnyxStatusWithRetry(sendResult.messageId)
      if (statusResult) {
        const normalizedStatus =
          statusResult.finalStatus ||
          resolveStatusFromClassification(statusResult.classification, finalStatus)
        finalStatus = normalizedStatus
        statusEvents.push({
          value: normalizedStatus,
          classification: statusResult.classification,
          source: 'status-poll',
          checkedAt: new Date().toISOString(),
          raw: statusResult.rawResponse ?? null,
        })
      }
    } catch (statusError) {
      console.error('send-direct-message: status fetch error', statusError)
      finalStatus = 'uncertain'
      statusEvents.push({
        value: 'uncertain',
        source: 'status-poll-error',
        checkedAt: new Date().toISOString(),
        raw: String(statusError),
      })
    } finally {
      statusDetails = {
        provider: 'telnyx',
        providerMessageId: sendResult.messageId,
        events: [...statusEvents],
      }
    }

    await recordConversationMessage({
      userId,
      customer,
      messageText: personalizedText,
      timestamp: sendTimestamp,
      status: finalStatus || 'queued',
      providerMessageId: sendResult.messageId,
      statusDetails,
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: {
          id: sendResult.messageId,
          content: personalizedText,
          timestamp: sendTimestamp,
          status: finalStatus || 'queued',
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('send-direct-message: unhandled error', error)
    return new Response(JSON.stringify({ error: 'Failed to send message' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

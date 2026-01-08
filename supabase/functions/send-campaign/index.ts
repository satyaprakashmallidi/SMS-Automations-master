import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { sendTelnyxMessage, delay } from './telnyxSendMessage.ts'
import { fetchTelnyxStatusWithRetry } from './telnyxFetchStatus.ts'

interface CampaignRow {
  id: string
  user_id: string
  name: string
  message: string
  customers: any[]
  sent_customers: any[]
  sent_count: number
  delivered_customers: any[]
  delivered_count: number
  failed_customers: any[]
  failed_count: number
  status: string
}

// SUPABASE_URL is provided automatically in the Edge Function environment.
// SERVICE_ROLE_KEY must be set via `supabase secrets set SERVICE_ROLE_KEY="..."`.
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') ?? ''

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase env vars for send-campaign function')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
})

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function getConversationCustomerId(customer: any): string | null {
  const rawId =
    customer?.conversationCustomerId ??
    customer?.id ??
    customer?.customer_id ??
    customer?.customerId

  if (rawId === undefined || rawId === null) return null
  return String(rawId)
}

function renderPersonalizedMessage(baseText: string, customer: any, settings?: any): string {
  if (!baseText) return baseText

  const safe = (value: unknown): string => {
    if (value === null || value === undefined) return ''
    return String(value)
  }

  const replacements: Record<string, string> = {
    name: safe(customer.name),
    email: safe(customer.email),
    phone: safe(
      customer.phone ||
        customer.phone_number ||
        customer.phoneNumber
    ),
    status: safe(customer.status),
    type: safe(customer.type),
    address: safe(customer.address),
    'last service': safe(customer.lastService || customer.last_service),
    'total spent': safe(customer.totalSpent || customer.total_spent),
  }

  if (settings) {
    const profileFirst = safe(settings.first_name)
    const profileLast = safe(settings.last_name)
    const profileFullName = `${profileFirst} ${profileLast}`.trim() || profileFirst || profileLast

    const profileReplacements: Record<string, string> = {
      'profile name': profileFullName,
      'profile first name': profileFirst,
      'profile last name': profileLast,
      'profile email': safe(settings.email),
      'profile phone': safe(settings.phone),
      'company name': safe(settings.company_name),
      'company address': safe(settings.business_address),
      'company phone': safe(settings.business_phone),
      'company website': safe(settings.website),
      'sender name': safe(settings.sender_name),
    }

    for (const [key, value] of Object.entries(profileReplacements)) {
      if (value) {
        replacements[key] = value
      }
    }
  }

  const escapeRegExp = (str: string) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  let text = baseText

  for (const [key, value] of Object.entries(replacements)) {
    const pattern = new RegExp(`{{\\s*${escapeRegExp(key)}\\s*}}`, 'gi')
    text = text.replace(pattern, value)
  }

  return text
}

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

interface SendResultEntry {
  customer: any
  messageId?: string
  personalizedText: string
  timestamp: string
  initialStatus?: string | null
  sendResponse?: unknown
}

async function recordConversationMessage(params: {
  userId: string
  customer: any
  messageText: string
  timestamp: string
  status: string
  campaignId: string
  direction?: 'outbound' | 'inbound'
  providerMessageId?: string | null
  statusDetails?: MessageStatusDetails | null
}) {
  const {
    userId,
    customer,
    messageText,
    timestamp,
    status,
    campaignId,
    direction = 'outbound',
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

    if (error) {
      throw error
    }

    const latestStatus =
      statusDetails?.events?.[statusDetails.events.length - 1]?.value || status
    const normalizedStatus = latestStatus ? String(latestStatus).toLowerCase() : ''

    const messageEntry: Record<string, any> = {
      id: crypto.randomUUID(),
      direction,
      content: messageText || '',
      status: normalizedStatus || (direction === 'inbound' ? 'received' : 'unknown'),
      campaignId,
      providerMessageId: providerMessageId || null,
      timestamp: timestamp || new Date().toISOString(),
    }

    if (statusDetails && statusDetails.events?.length) {
      messageEntry.statusDetails = statusDetails
    }

    const existingMessages = Array.isArray(existingRow?.messages)
      ? existingRow?.messages
      : []
    const nextMessages = [...existingMessages, messageEntry]

    const payload = {
      customer_name: customer?.name || existingRow?.customer_name || '',
      messages: nextMessages,
      last_message: messageEntry.content,
      last_message_at: messageEntry.timestamp,
      unread_count: direction === 'inbound' ? (existingRow?.unread_count || 0) + 1 : 0,
      status:
        direction === 'outbound'
          ? normalizedStatus || existingRow?.status || 'sent'
          : existingRow?.status || 'open',
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
    console.error('send-campaign: failed to record conversation message', {
      campaignId,
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

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  }

  try {
    const body = await req.json()
    const campaignId: string | undefined = body?.campaignId

    if (!campaignId) {
      return new Response(JSON.stringify({ error: 'campaignId is required' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      })
    }

    // Load campaign
    const { data: campaign, error: fetchError } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (fetchError || !campaign) {
      console.error('Error loading campaign in send-campaign:', fetchError)
      return new Response(JSON.stringify({ error: 'Campaign not found' }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      })
    }

    const customers = Array.isArray(campaign.customers) ? campaign.customers : []

    // Load user's SMS/profile/company settings (including default signature)
    let messageText: string = (campaign.message as string) ?? ''
    let settingsRow: any = null
    try {
      const { data, error: settingsError } = await supabaseAdmin
        .from('settings')
        .select(
          'first_name,last_name,email,phone,company_name,business_address,business_phone,website,sender_name,default_signature',
        )
        .eq('user_id', campaign.user_id)
        .maybeSingle()

      if (settingsError) {
        console.error('send-campaign: error loading settings for user', {
          userId: campaign.user_id,
          error: settingsError,
        })
      } else if (data) {
        settingsRow = data

        if (data.default_signature) {
          const signature = String(data.default_signature).trim()
          if (signature.length > 0) {
            const base = messageText ?? ''
            // Append signature on a new line so it's clearly separated
            messageText =
              base.trimEnd().length > 0 ? `${base.trimEnd()}\n${signature}` : signature
          }
        }
      }
    } catch (settingsUnexpectedError) {
      console.error('send-campaign: unexpected error loading settings', settingsUnexpectedError)
    }

    console.log('send-campaign: loaded campaign', {
      campaignId,
      customerCount: customers.length,
    })

    // Mark campaign as active while sending
    const now = new Date().toISOString()
    await supabaseAdmin
      .from('campaigns')
      .update({
        status: 'active',
        sent_at: now,
      })
      .eq('id', campaignId)

    const sentCustomers: any[] = []
    const sendResults: SendResultEntry[] = []

    // Send messages sequentially with 0.5s delay
    for (const customer of customers) {
      const toNumber: string | undefined =
        customer.phone || customer.phone_number || customer.phoneNumber

      if (!toNumber) {
        sendResults.push({ customer })
        sentCustomers.push({ ...customer, status: 'failed', error: 'Missing phone number' })
        continue
      }

      const personalizedText = renderPersonalizedMessage(messageText, customer, settingsRow)
      const messageTimestamp = new Date().toISOString()

      try {
        const { messageId, initialStatus, rawResponse } = await sendTelnyxMessage(
          toNumber,
          personalizedText,
        )

        sendResults.push({
          customer,
          messageId,
          personalizedText,
          timestamp: messageTimestamp,
          initialStatus: initialStatus ?? 'queued',
          sendResponse: rawResponse ?? null,
        })
        sentCustomers.push({
          ...customer,
          telnyxMessageId: messageId,
          telnyxInitialStatus: initialStatus,
          telnyxSendResponse: rawResponse,
        })
      } catch (error) {
        console.error('Error sending Telnyx message:', error)
        sentCustomers.push({
          ...customer,
          status: 'failed',
          telnyxError: String(error),
        })

        const errorDetails: MessageStatusDetails = {
          provider: 'telnyx',
          providerMessageId: null,
          events: [
            {
              value: 'failed',
              source: 'send-error',
              checkedAt: messageTimestamp,
              raw: String(error),
            },
          ],
        }

        await recordConversationMessage({
          userId: campaign.user_id,
          customer,
          messageText: personalizedText,
          timestamp: messageTimestamp,
          status: 'failed',
          campaignId,
          statusDetails: errorDetails,
        })
      }

      // Rate limiting: 0.5 seconds between messages
      await delay(500)
    }

    const sentCount = sentCustomers.filter((c) => c.telnyxMessageId).length

    console.log('send-campaign: send phase completed', {
      campaignId,
      attempted: customers.length,
      sentWithMessageId: sentCount,
    })

    // Update campaign with initial send info
    await supabaseAdmin
      .from('campaigns')
      .update({
        sent_customers: sentCustomers,
        sent_count: sentCount,
        status: 'active',
      })
      .eq('id', campaignId)

    const deliveredCustomers: any[] = []
    const failedCustomers: any[] = []
    const uncertainCustomers: any[] = []

    let totalCost = 0

    // Status checks for each successfully sent message
    for (const result of sendResults) {
      if (!result.messageId) {
        // Failed to send, already marked above
        continue
      }

      const customer = result.customer

      try {
        const { finalStatus, classification, costAmount, rawResponse } =
          await fetchTelnyxStatusWithRetry(result.messageId, {
            maxAttempts: 12,
            queuedDelayMs: 5000,
          })

        const statusEvents: StatusEvent[] = []
        if (result.initialStatus) {
          statusEvents.push({
            value: result.initialStatus || 'queued',
            source: 'send-response',
            checkedAt: result.timestamp,
            raw: result.sendResponse ?? null,
          })
        }

        const pollEvent: StatusEvent = {
          value: finalStatus || classification,
          classification,
          source: 'status-poll',
          checkedAt: new Date().toISOString(),
          raw: rawResponse ?? null,
        }
        statusEvents.push(pollEvent)

        const statusDetails: MessageStatusDetails = {
          provider: 'telnyx',
          providerMessageId: result.messageId,
          events: statusEvents,
        }

        if (typeof costAmount === 'number' && !Number.isNaN(costAmount)) {
          totalCost += costAmount
        }

        const enrichedCustomer = {
          ...customer,
          telnyxMessageId: result.messageId,
          telnyxFinalStatus: finalStatus,
          telnyxStatusResponse: rawResponse,
        }

        if (classification === 'success') {
          deliveredCustomers.push({ ...enrichedCustomer, status: 'sent' })
          await recordConversationMessage({
            userId: campaign.user_id,
            customer,
            messageText: result.personalizedText,
            timestamp: result.timestamp,
            status: 'delivered',
            campaignId,
            providerMessageId: result.messageId,
            statusDetails,
          })
        } else if (classification === 'failed') {
          failedCustomers.push({ ...enrichedCustomer, status: 'failed' })
          await recordConversationMessage({
            userId: campaign.user_id,
            customer,
            messageText: result.personalizedText,
            timestamp: result.timestamp,
            status: 'failed',
            campaignId,
            providerMessageId: result.messageId,
            statusDetails,
          })
        } else {
          // Option A: uncertain goes into failed_customers with status 'uncertain'
          uncertainCustomers.push({ ...enrichedCustomer, status: 'uncertain' })
          await recordConversationMessage({
            userId: campaign.user_id,
            customer,
            messageText: result.personalizedText,
            timestamp: result.timestamp,
            status: 'uncertain',
            campaignId,
            providerMessageId: result.messageId,
            statusDetails,
          })
        }
      } catch (error) {
        console.error('Error fetching Telnyx status:', error)
        uncertainCustomers.push({
          ...customer,
          telnyxMessageId: result.messageId,
          status: 'uncertain',
          telnyxStatusError: String(error),
        })

        const errorDetails: MessageStatusDetails = {
          provider: 'telnyx',
          providerMessageId: result.messageId,
          events: [
            {
              value: 'uncertain',
              source: 'status-poll-error',
              checkedAt: new Date().toISOString(),
              raw: String(error),
            },
          ],
        }

        await recordConversationMessage({
          userId: campaign.user_id,
          customer,
          messageText: result.personalizedText,
          timestamp: result.timestamp,
          status: 'uncertain',
          campaignId,
          providerMessageId: result.messageId,
          statusDetails: errorDetails,
        })
      }
    }

    const deliveredCount = deliveredCustomers.length

    // Merge with any existing failed customers from prior runs
    const existingFailed = Array.isArray(campaign.failed_customers)
      ? campaign.failed_customers
      : []

    // Failures that happened at send time (no Telnyx messageId)
    const sendPhaseFailedCustomers = sentCustomers.filter(
      (c) =>
        !c.telnyxMessageId &&
        (c.status === 'failed' || c.telnyxError || c.error || c.telnyxStatusError)
    )

    const allFailedCustomers = existingFailed.concat(
      sendPhaseFailedCustomers,
      failedCustomers,
      uncertainCustomers
    )

    const failedCount = allFailedCustomers.length

    console.log('send-campaign: status phase completed', {
      campaignId,
      deliveredCount,
      failedCount,
      uncertainCount: uncertainCustomers.length,
      totalCost,
    })

    await supabaseAdmin
      .from('campaigns')
      .update({
        delivered_customers: deliveredCustomers,
        delivered_count: deliveredCount,
        failed_customers: allFailedCustomers,
        failed_count: failedCount,
        actual_cost: totalCost,
        status: 'completed',
      })
      .eq('id', campaignId)

    return new Response(
      JSON.stringify({
        sentCustomers,
        deliveredCustomers,
        failedCustomers: allFailedCustomers,
        uncertainCustomers,
        totalCost,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Unhandled error in send-campaign function:', error)

    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  }
})

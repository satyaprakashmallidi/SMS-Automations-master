import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') ?? ''
const telnyxPublicKey = Deno.env.get('TELNYX_PUBLIC_KEY') ?? ''

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase env vars for inbound-message function')
}

if (!telnyxPublicKey) {
  console.error('Missing TELNYX_PUBLIC_KEY for inbound-message function')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
})

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, telnyx-signature-ed25519, telnyx-signature, telnyx-timestamp',
}

const normalizePhoneNumber = (input: string | null | undefined): string | null => {
  if (!input) return null
  const trimmed = input.trim()
  const digits = trimmed.replace(/[^\d]/g, '')
  if (!digits) return null

  if (digits.length === 10) {
    return `+1${digits}`
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }
  if (trimmed.startsWith('+')) {
    return `+${digits}`
  }
  return `+${digits}`
}

const base64ToUint8Array = (base64: string): Uint8Array => {
  // Handles padding '=' correctly; do not trim
  const cleaned = base64.replace(/-/g, '+').replace(/_/g, '/')
  const padded = cleaned.padEnd(cleaned.length + ((4 - (cleaned.length % 4)) % 4), '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function verifyTelnyxEd25519(req: Request, rawBody: string): Promise<{ valid: boolean; error?: string }> {
  if (!telnyxPublicKey) {
    const error = 'TELNYX_PUBLIC_KEY is not set'
    console.error(error)
    return { valid: false, error }
  }

  const signature =
    req.headers.get('telnyx-signature-ed25519') ||
    req.headers.get('Telnyx-Signature-Ed25519') ||
    req.headers.get('telnyx-signature') ||
    req.headers.get('Telnyx-Signature') ||
    ''

  const timestamp =
    req.headers.get('telnyx-timestamp') ||
    req.headers.get('Telnyx-Timestamp') ||
    ''

  if (!signature || !timestamp) {
    const error = `Missing Telnyx signature headers. sig=${!!signature}, ts=${!!timestamp}`
    console.error(error)
    return { valid: false, error }
  }

  try {
    const publicKeyBytes = base64ToUint8Array(telnyxPublicKey.trim())
    const signatureBytes = base64ToUint8Array(signature.trim())

    const key = await crypto.subtle.importKey(
      'raw',
      publicKeyBytes,
      { name: 'Ed25519', namedCurve: 'Ed25519' },
      false,
      ['verify'],
    )

    const message = new TextEncoder().encode(`${timestamp}|${rawBody}`)
    const isValid = await crypto.subtle.verify('Ed25519', key, signatureBytes, message)

    if (!isValid) {
      const error = 'Telnyx signature verification failed - signature mismatch'
      console.error(error)
      return { valid: false, error }
    }

    return { valid: true }
  } catch (error) {
    const errorMsg = `Error verifying Telnyx signature (Ed25519): ${error}`
    console.error(errorMsg)
    return { valid: false, error: errorMsg }
  }
}

type TelnyxPayload = {
  data?: {
    event_type?: string
    id?: string
    occurred_at?: string
    record?: {
      from?: { phone_number?: string; name?: string }
      to?: Array<{ phone_number?: string; status?: string }>
      text?: string
      status?: string
      id?: string
      received_at?: string
      is_spam?: boolean
    }
    payload?: {
      from?: { phone_number?: string; name?: string }
      to?: Array<{ phone_number?: string; status?: string }>
      text?: string
      status?: string
      id?: string
      received_at?: string
      is_spam?: boolean
    }
  }
}

const extractMessageDetails = (payload: TelnyxPayload) => {
  // Support both data.record and data.payload shapes from Telnyx
  const record = payload?.data?.record || payload?.data?.payload || {}
  const toNumber = normalizePhoneNumber(record.to?.[0]?.phone_number || '')
  const fromNumber = normalizePhoneNumber(record.from?.phone_number || '')
  const messageText = record.text || ''
  const messageId = record.id || payload?.data?.id || crypto.randomUUID()
  const toStatus = record.to?.[0]?.status || ''
  const eventStatus = record.status || toStatus || payload?.data?.event_type || 'received'
  // Prefer message-level received_at over event-level occurred_at
  const receivedAt =
    record.received_at || payload?.data?.occurred_at || new Date().toISOString()

  const fromName = record.from?.name || ''
  const isSpam = record.is_spam === true

  return { toNumber, fromNumber, messageText, messageId, eventStatus, receivedAt, fromName, isSpam }
}

const findAllUsersByExistingCustomer = async (fromNumber: string | null) => {
  if (!fromNumber) return []

  const matchedUsers: Array<{
    userSettings: any
    customer: any
  }> = []

  // Get all users' customer data
  const { data: allCustomersRows, error: customersError } = await supabaseAdmin
    .from('customers')
    .select('user_id, customers_data')

  if (customersError || !allCustomersRows) {
    console.error('Error fetching customers for routing', customersError)
    return []
  }

  // Check each user's customer list for a match
  for (const row of allCustomersRows) {
    if (!row.customers_data || !Array.isArray(row.customers_data)) continue

    const matchedCustomer = (row.customers_data as any[]).find((c) => {
      const candidate = c?.phone || c?.phone_number || c?.phoneNumber || c?.customerPhone
      return normalizePhoneNumber(candidate) === fromNumber
    })

    if (matchedCustomer) {
      // Found a match - get this user's settings
      const { data: settingsRow } = await supabaseAdmin
        .from('settings')
        .select('user_id, phone, business_phone, sender_name, first_name, last_name, email, company_name')
        .eq('user_id', row.user_id)
        .maybeSingle()

      if (settingsRow) {
        matchedUsers.push({
          userSettings: settingsRow,
          customer: matchedCustomer,
        })
      }
    }
  }

  return matchedUsers
}

const findPrimaryUserForNumber = async (toNumber: string | null) => {
  if (!toNumber) return null

  const { data, error } = await supabaseAdmin
    .from('settings')
    .select('user_id, phone, business_phone, sender_name, first_name, last_name, email, company_name')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('inbound-message: failed to load settings for primary user lookup', error)
    return null
  }

  // Only match against the phone field (not business_phone) for inbound routing
  const match = (data || []).find((row) => {
    return normalizePhoneNumber(row.phone) === toNumber
  })

  return match || null
}

const findExistingCustomer = async (
  userId: string,
  fromNumber: string,
) => {
  const normalizedFrom = normalizePhoneNumber(fromNumber)

  const { data: customersRow, error: customersError } = await supabaseAdmin
    .from('customers')
    .select('customers_data')
    .eq('user_id', userId)
    .maybeSingle()

  if (customersError && customersError.code !== 'PGRST116') {
    throw customersError
  }

  if (!customersRow?.customers_data) return null

  const customersArray: any[] = Array.isArray(customersRow.customers_data)
    ? customersRow.customers_data
    : []

  const matchedCustomer =
    customersArray.find((c) => {
      const candidate =
        c?.phone ||
        c?.phone_number ||
        c?.phoneNumber ||
        c?.customerPhone
      return normalizePhoneNumber(candidate) === normalizedFrom
    }) || null

  return matchedCustomer
}

const logWebhookEvent = async (payload: TelnyxPayload) => {
  try {
    const record = payload?.data?.record || payload?.data?.payload || {}
    const eventType = payload?.data?.event_type || 'unknown'
    const eventId = payload?.data?.id || null
    const occurredAt = payload?.data?.occurred_at || record.received_at || new Date().toISOString()
    const direction = record.direction || null
    const fromNumber = normalizePhoneNumber(record.from?.phone_number || '')
    const toNumber = normalizePhoneNumber(record.to?.[0]?.phone_number || '')
    const messageText = record.text || ''
    const messageId = record.id || null
    const isSpam = record.is_spam === true
    const status = isSpam ? 'spam' : (record.status || record.to?.[0]?.status || eventType)

    await supabaseAdmin.from('webhook_logs').insert({
      event_type: eventType,
      event_id: eventId,
      occurred_at: occurredAt,
      direction,
      from_number: fromNumber,
      to_number: toNumber,
      message_text: messageText,
      message_id: messageId,
      status,
      processed: false,
      raw_payload: payload,
    })
  } catch (error) {
    console.error('Failed to log webhook event', error)
    // Don't throw - logging failure shouldn't stop webhook processing
  }
}

const appendConversationMessage = async ({
  userId,
  customerPhone,
  customerName,
  messageText,
  messageId,
  eventStatus,
  receivedAt,
  rawPayload,
}: {
  userId: string
  customerPhone: string
  customerName: string
  messageText: string
  messageId: string
  eventStatus: string
  receivedAt: string
  rawPayload: any
}) => {
  // Use phone number as the customer_id for conversation tracking
  const customerId = normalizePhoneNumber(customerPhone)
  if (!customerId) return

  const { data: existingRow, error } = await supabaseAdmin
    .from('customer_conversations')
    .select('id, messages, unread_count, customer_name, status')
    .eq('user_id', userId)
    .eq('customer_id', customerId)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    throw error
  }

  const statusDetails = {
    provider: 'telnyx',
    providerMessageId: messageId,
    events: [
      {
        value: eventStatus || 'received',
        source: 'webhook',
        checkedAt: receivedAt,
        raw: rawPayload || null,
      },
    ],
  }

  const messageEntry: Record<string, any> = {
    id: crypto.randomUUID(),
    direction: 'inbound',
    content: messageText || '',
    status: (eventStatus || 'received').toLowerCase(),
    providerMessageId: messageId,
    timestamp: receivedAt,
    statusDetails,
    campaignId: 'direct-message',
  }

  const existingMessages = Array.isArray(existingRow?.messages)
    ? existingRow?.messages
    : []
  const nextMessages = [...existingMessages, messageEntry]

  const payload = {
    user_id: userId,
    customer_id: customerId,
    customer_name: customerName || existingRow?.customer_name || '',
    messages: nextMessages,
    last_message: messageEntry.content,
    last_message_at: messageEntry.timestamp,
    unread_count: (existingRow?.unread_count || 0) + 1,
    status: existingRow?.status || 'open',
  }

  if (existingRow?.id) {
    const { error: updateError } = await supabaseAdmin
      .from('customer_conversations')
      .update(payload)
      .eq('id', existingRow.id)

    if (updateError) {
      throw updateError
    }
  } else {
    const { error: insertError } = await supabaseAdmin
      .from('customer_conversations')
      .insert(payload)

    if (insertError) {
      throw insertError
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const rawBody = await req.text()

  // Verify Telnyx webhook signature
  const verificationResult = await verifyTelnyxEd25519(req, rawBody)
  
  if (!verificationResult.valid) {
    console.error('Signature verification failed:', verificationResult.error)
    return new Response(
      JSON.stringify({
        error: 'Signature verification failed',
        details: verificationResult.error,
      }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }

  let payload: TelnyxPayload
  try {
    payload = rawBody ? JSON.parse(rawBody) : {}
  } catch (error) {
    console.error('inbound-message: failed to parse JSON', error)
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // STEP 1: Log every webhook event to webhook_logs table
  await logWebhookEvent(payload)

  const eventType = payload?.data?.event_type || ''

  // STEP 2: Only process message.received events for inbox routing
  // All other events (message.sent, message.delivered, message.finalized, etc.) are logged but not routed
  if (eventType !== 'message.received') {
    console.log('inbound-message: non-inbound event logged', { eventType })
    return new Response(
      JSON.stringify({
        success: true,
        logged: true,
        processed: false,
        eventType,
        reason: 'Only message.received events are routed to inbox',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }

  // STEP 3: Continue with inbox routing for message.received
  const { toNumber, fromNumber, messageText, messageId, eventStatus, receivedAt, fromName, isSpam } =
    extractMessageDetails(payload)

  // STEP 3.1: Filter out spam messages
  if (isSpam) {
    console.log('inbound-message: spam message filtered', { fromNumber, messageId })
    return new Response(
      JSON.stringify({
        success: true,
        logged: true,
        processed: false,
        filtered: true,
        reason: 'Message marked as spam by Telnyx',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }

  if (!toNumber || !fromNumber) {
    console.error('inbound-message: missing to/from number', {
      toNumber,
      fromNumber,
    })
    return new Response(JSON.stringify({ error: 'Missing to/from numbers' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // Step 1: Try to find ALL users with existing customer conversation history
    const matchedUsers = await findAllUsersByExistingCustomer(fromNumber)

    // Step 2: If no existing users found, fallback to primary user for this destination number
    if (matchedUsers.length === 0) {
      const primaryUserSettings = await findPrimaryUserForNumber(toNumber)

      if (!primaryUserSettings?.user_id) {
        console.error('inbound-message: no user mapped for destination', {
          toNumber,
          fromNumber,
        })
        return new Response(JSON.stringify({ error: 'No user mapped for number' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const userId = primaryUserSettings.user_id
      
      // Check if customer exists in customers_data (explicitly added by user)
      const existingCustomer = await findExistingCustomer(userId, fromNumber)
      const customerName = existingCustomer?.name || fromName || `Incoming ${fromNumber}`

      await appendConversationMessage({
        userId,
        customerPhone: fromNumber,
        customerName,
        messageText,
        messageId,
        eventStatus,
        receivedAt,
        rawPayload: payload,
      })

      // Mark webhook as processed in logs
      await supabaseAdmin
        .from('webhook_logs')
        .update({
          processed: true,
          user_id: userId,
        })
        .eq('message_id', messageId)
        .eq('event_type', 'message.received')

      return new Response(
        JSON.stringify({
          success: true,
          routedTo: 'primary',
          users: [{ userId, customerId: fromNumber }],
          messageId,
          logged: true,
          processed: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // Step 3: Append message to ALL matched users' inboxes
    const results = []
    for (const { userSettings, customer } of matchedUsers) {
      const userId = userSettings.user_id
      const customerName = customer?.name || fromName || `Incoming ${fromNumber}`

      await appendConversationMessage({
        userId,
        customerPhone: fromNumber,
        customerName,
        messageText,
        messageId,
        eventStatus,
        receivedAt,
        rawPayload: payload,
      })

      results.push({
        userId,
        customerId: fromNumber,
      })
    }

    // Mark webhook as processed in logs
    await supabaseAdmin
      .from('webhook_logs')
      .update({
        processed: true,
        user_id: results[0]?.userId || null,
      })
      .eq('message_id', messageId)
      .eq('event_type', 'message.received')

    return new Response(
      JSON.stringify({
        success: true,
        routedTo: 'existing',
        users: results,
        messageId,
        logged: true,
        processed: true,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('inbound-message: unhandled error', error)
    return new Response(JSON.stringify({ error: 'Failed to process inbound message' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

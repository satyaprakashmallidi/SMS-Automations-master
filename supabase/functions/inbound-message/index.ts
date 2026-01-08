import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') ?? ''
const telnyxWebhookSecret = Deno.env.get('TELNYX_WEBHOOK_SECRET') ?? ''

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase env vars for inbound-message function')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
})

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, telnyx-signature, telnyx-timestamp',
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

const toHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

const toBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

const timingSafeEqual = (a: string, b: string): boolean => {
  const aBytes = new TextEncoder().encode(a)
  const bBytes = new TextEncoder().encode(b)
  if (aBytes.length !== bBytes.length) return false

  let result = 0
  for (let i = 0; i < aBytes.length; i++) {
    result |= aBytes[i] ^ bBytes[i]
  }
  return result === 0
}

async function verifyTelnyxSignature(req: Request, rawBody: string): Promise<boolean> {
  if (!telnyxWebhookSecret) return true

  const signatureHeader =
    req.headers.get('telnyx-signature') ||
    req.headers.get('Telnyx-Signature') ||
    ''
  const timestamp =
    req.headers.get('telnyx-timestamp') ||
    req.headers.get('Telnyx-Timestamp') ||
    ''

  if (!signatureHeader || !timestamp) {
    console.error('Missing Telnyx signature headers')
    return false
  }

  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(telnyxWebhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )

    const payload = encoder.encode(`${timestamp}|${rawBody}`)
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, payload)

    const computedHex = toHex(signatureBuffer)
    const computedBase64 = toBase64(signatureBuffer)

    const provided = signatureHeader.trim()

    if (timingSafeEqual(provided, computedHex) || timingSafeEqual(provided, computedBase64)) {
      return true
    }

    console.error('Telnyx signature verification failed')
    return false
  } catch (error) {
    console.error('Error verifying Telnyx signature', error)
    return false
  }
}

type TelnyxPayload = {
  data?: {
    event_type?: string
    id?: string
    occurred_at?: string
    record?: {
      from?: { phone_number?: string; name?: string }
      to?: Array<{ phone_number?: string }>
      text?: string
      status?: string
      id?: string
    }
  }
}

const extractMessageDetails = (payload: TelnyxPayload) => {
  const record = payload?.data?.record || {}
  const toNumber = normalizePhoneNumber(record.to?.[0]?.phone_number || '')
  const fromNumber = normalizePhoneNumber(record.from?.phone_number || '')
  const messageText = record.text || ''
  const messageId = record.id || payload?.data?.id || crypto.randomUUID()
  const eventStatus = record.status || payload?.data?.event_type || 'received'
  const receivedAt = payload?.data?.occurred_at || new Date().toISOString()

  const fromName = record.from?.name || ''

  return { toNumber, fromNumber, messageText, messageId, eventStatus, receivedAt, fromName }
}

const findUserByDestinationNumber = async (toNumber: string | null) => {
  if (!toNumber) return null

  const { data, error } = await supabaseAdmin
    .from('settings')
    .select('user_id, phone, business_phone, sender_name, first_name, last_name, email, company_name')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('inbound-message: failed to load settings for lookup', error)
    return null
  }

  const match = (data || []).find((row) => {
    const phoneMatch = normalizePhoneNumber(row.phone) === toNumber
    const businessMatch = normalizePhoneNumber(row.business_phone) === toNumber
    return phoneMatch || businessMatch
  })

  return match || null
}

const getOrCreateCustomer = async (
  userId: string,
  fromNumber: string,
  fromName: string,
) => {
  const normalizedFrom = normalizePhoneNumber(fromNumber)
  const fallbackName = fromName || `Incoming ${normalizedFrom || 'customer'}`

  const { data: customersRow, error: customersError } = await supabaseAdmin
    .from('customers')
    .select('id, customers_data')
    .eq('user_id', userId)
    .maybeSingle()

  if (customersError && customersError.code !== 'PGRST116') {
    throw customersError
  }

  let customersArray: any[] = Array.isArray(customersRow?.customers_data)
    ? customersRow?.customers_data
    : []

  let matchedCustomer =
    customersArray.find((c) => {
      const candidate =
        c?.phone ||
        c?.phone_number ||
        c?.phoneNumber ||
        c?.customerPhone
      return normalizePhoneNumber(candidate) === normalizedFrom
    }) || null

  if (!matchedCustomer) {
    matchedCustomer = {
      id: crypto.randomUUID(),
      name: fallbackName,
      phone: fromNumber,
      status: 'active',
      source: 'inbound',
      createdAt: new Date().toISOString(),
    }
    customersArray = [...customersArray, matchedCustomer]
  }

  if (!customersRow) {
    const { data, error } = await supabaseAdmin
      .from('customers')
      .insert([{ user_id: userId, customers_data: customersArray }])
      .select('customers_data')
      .single()
    if (error) throw error
    return { customer: matchedCustomer, customersArray: data?.customers_data || customersArray }
  }

  if (customersArray !== customersRow.customers_data) {
    const { data, error } = await supabaseAdmin
      .from('customers')
      .update({ customers_data: customersArray })
      .eq('user_id', userId)
      .select('customers_data')
      .single()

    if (error) throw error
    customersArray = data?.customers_data || customersArray
  }

  return { customer: matchedCustomer, customersArray }
}

const appendConversationMessage = async ({
  userId,
  customer,
  messageText,
  messageId,
  eventStatus,
  receivedAt,
  rawPayload,
}: {
  userId: string
  customer: any
  messageText: string
  messageId: string
  eventStatus: string
  receivedAt: string
  rawPayload: any
}) => {
  const customerId = customer?.id ? String(customer.id) : null
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
    customer_name: customer?.name || existingRow?.customer_name || '',
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

  const isVerified = await verifyTelnyxSignature(req, rawBody)
  if (!isVerified) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
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

  const { toNumber, fromNumber, messageText, messageId, eventStatus, receivedAt, fromName } =
    extractMessageDetails(payload)

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
    const userSettings = await findUserByDestinationNumber(toNumber)
    if (!userSettings?.user_id) {
      console.error('inbound-message: no user mapped for destination', { toNumber })
      return new Response(JSON.stringify({ error: 'No user mapped for number' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userId = userSettings.user_id

    const { customer } = await getOrCreateCustomer(userId, fromNumber, fromName || '')

    await appendConversationMessage({
      userId,
      customer,
      messageText,
      messageId,
      eventStatus,
      receivedAt,
      rawPayload: payload,
    })

    return new Response(
      JSON.stringify({
        success: true,
        userId,
        customerId: customer?.id,
        messageId,
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

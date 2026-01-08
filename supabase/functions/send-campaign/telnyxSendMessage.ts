const TELNYX_API_URL = 'https://api.telnyx.com/v2/messages'

const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')
const rawFromNumber = Deno.env.get('TELNYX_FROM_NUMBER') ?? '+18334905225'

if (!telnyxApiKey) {
  throw new Error('TELNYX_API_KEY is not set in the environment')
}

const normalizePhoneNumber = (input: string): string | null => {
  if (!input) return null
  const trimmed = input.trim()
  const hasPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/[^\d]/g, '')
  if (!digits) return null
  
  // If exactly 10 digits, assume US and add +1
  if (digits.length === 10) {
    return `+1${digits}`
  }
  
  // If 11 digits starting with 1, it's likely US with country code - just add +
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }
  
  // For other formats, add + if not present
  return `+${digits}`
}

const fromNumber = normalizePhoneNumber(rawFromNumber) ?? '+18334905225'

/**
 * Small delay helper
 */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export interface SendMessageResult {
  messageId: string
  initialStatus: string | null
  costAmount?: number
  rawResponse: unknown
}

export async function sendTelnyxMessage(to: string, text: string): Promise<SendMessageResult> {
  const toNumber = normalizePhoneNumber(to)
  if (!toNumber) {
    throw new Error(`Invalid destination phone number: "${to}"`)
  }

  const response = await fetch(TELNYX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${telnyxApiKey}`,
    },
    body: JSON.stringify({
      from: fromNumber,
      to: toNumber,
      text,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Telnyx send error: ${response.status} ${errorBody}`)
  }

  const json = await response.json()
  const data = (json && (json.data ?? json)) as any

  const messageId: string = data.id ?? data?.data?.id
  const status: string | null = data?.to?.[0]?.status ?? data?.status ?? null

  let costAmount: number | undefined
  if (typeof data?.cost?.amount === 'string' || typeof data?.cost?.amount === 'number') {
    costAmount = Number(data.cost.amount)
  }

  return {
    messageId,
    initialStatus: status,
    costAmount,
    rawResponse: data,
  }
}

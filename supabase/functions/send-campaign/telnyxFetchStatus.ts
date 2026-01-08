const TELNYX_STATUS_URL = 'https://api.telnyx.com/v2/messages'

const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')

if (!telnyxApiKey) {
  throw new Error('TELNYX_API_KEY is not set in the environment')
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export type TelnyxStatusClassification = 'success' | 'failed' | 'uncertain' | 'queued'

export interface StatusResult {
  finalStatus: string
  classification: TelnyxStatusClassification
  costAmount?: number
  rawResponse: unknown
}

const classifyStatus = (status: string | null): TelnyxStatusClassification => {
  if (!status) return 'uncertain'

  const s = status.toLowerCase()

  // Queued statuses
  if (s === 'queued' || s === 'accepted') return 'queued'

  // Success statuses - message was sent/delivered
  if (s === 'sent' || s === 'delivered' || s === 'sending') return 'success'

  // Failed statuses - message definitely failed
  if (
    s === 'failed' ||
    s === 'rejected' ||
    s === 'undelivered' ||
    s === 'receiving_failed' ||
    s === 'sending_failed' ||
    s === 'delivery_failed'
  ) {
    return 'failed'
  }
  
  // Timeout statuses - uncertain outcome
  if (s === 'gw_timeout' || s === 'dlr_timeout' || s.includes('timeout')) {
    return 'uncertain'
  }

  // Default to uncertain for unknown statuses
  return 'uncertain'
}

const isTerminalStatus = (status: string | null): boolean => {
  if (!status) return false
  const s = status.toLowerCase()
  if (s === 'delivered') return true
  if (
    s === 'failed' ||
    s === 'rejected' ||
    s === 'undelivered' ||
    s === 'receiving_failed' ||
    s === 'sending_failed' ||
    s === 'delivery_failed'
  ) {
    return true
  }
  return false
}

export async function fetchTelnyxStatusWithRetry(
  messageId: string,
  {
    maxAttempts = 12,
    queuedDelayMs = 5000,
  }: {
    maxAttempts?: number
    queuedDelayMs?: number
  } = {}
): Promise<StatusResult> {
  let lastData: any = null
  let status: string | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await fetch(`${TELNYX_STATUS_URL}/${messageId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${telnyxApiKey}`,
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`Telnyx status error: ${response.status} ${errorBody}`)
    }

    const json = await response.json()
    const data = (json && (json.data ?? json)) as any
    lastData = data

    status = data?.to?.[0]?.status ?? data?.status ?? null
    const classification = classifyStatus(status)

    const shouldContinue =
      classification === 'queued' || status?.toLowerCase() === 'sent' || status?.toLowerCase() === 'sending'

    if (!shouldContinue || isTerminalStatus(status)) {
      let costAmount: number | undefined
      if (data?.cost !== undefined && data?.cost !== null) {
        const rawCost = (data.cost as any).amount ?? (data.cost as any).cost ?? data.cost
        if (typeof rawCost === 'string' || typeof rawCost === 'number') {
          costAmount = Number(rawCost)
        }
      }

      return {
        finalStatus: status ?? 'unknown',
        classification,
        costAmount,
        rawResponse: data,
      }
    }

    if (attempt < maxAttempts) {
      await delay(queuedDelayMs)
    }
  }

  let costAmount: number | undefined
  if (lastData && lastData.cost !== undefined && lastData.cost !== null) {
    const rawCost = (lastData.cost as any).amount ?? (lastData.cost as any).cost ?? lastData.cost
    if (typeof rawCost === 'string' || typeof rawCost === 'number') {
      costAmount = Number(rawCost)
    }
  }

  return {
    finalStatus: status ?? 'unknown',
    classification: 'uncertain',
    costAmount,
    rawResponse: lastData,
  }
}

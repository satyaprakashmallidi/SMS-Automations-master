/**
 * Telnyx Status Poller
 * Helper functions to query Telnyx Message Status API
 */

export interface TelnyxMessageStatus {
  status: string
  completed_at: string | null
  errors: any[]
}

/**
 * Check the delivery status of a message from Telnyx
 * @param messageId - The Telnyx provider message ID
 * @param telnyxApiKey - Telnyx API key (from environment)
 * @returns Current message status information
 */
export async function checkMessageStatus(
  messageId: string,
  telnyxApiKey: string
): Promise<TelnyxMessageStatus> {
  try {
    const response = await fetch(
      `https://api.telnyx.com/v2/messages/${messageId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${telnyxApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error(`Telnyx API error: ${response.status} ${response.statusText}`)
      // Return unknown status on API error
      return {
        status: 'unknown',
        completed_at: null,
        errors: [{ message: `API returned ${response.status}` }],
      }
    }

    const data = await response.json()

    return {
      status: data.data?.to?.[0]?.status || 'unknown',
      completed_at: data.data?.completed_at || null,
      errors: data.data?.errors || [],
    }
  } catch (error) {
    console.error(`Error fetching message status from Telnyx:`, error)
    return {
      status: 'unknown',
      completed_at: null,
      errors: [{ message: String(error) }],
    }
  }
}

/**
 * Batch check multiple message statuses
 * @param messageIds - Array of Telnyx provider message IDs
 * @param telnyxApiKey - Telnyx API key
 * @returns Map of messageId to status
 */
export async function batchCheckMessageStatus(
  messageIds: string[],
  telnyxApiKey: string
): Promise<Map<string, TelnyxMessageStatus>> {
  const results = new Map<string, TelnyxMessageStatus>()

  // Process in parallel but with rate limiting (max 10 concurrent)
  const batchSize = 10
  for (let i = 0; i < messageIds.length; i += batchSize) {
    const batch = messageIds.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(async (messageId) => {
        const status = await checkMessageStatus(messageId, telnyxApiKey)
        return { messageId, status }
      })
    )

    batchResults.forEach(({ messageId, status }) => {
      results.set(messageId, status)
    })
  }

  return results
}

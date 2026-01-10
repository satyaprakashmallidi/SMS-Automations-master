/**
 * Message Status Checker
 * Database query and update logic for checking message delivery status
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface MessageToCheck {
  conversationId: string
  userId: string
  customerId: string
  messageId: string
  messageIndex: number
  providerMessageId: string
  currentStatus: string
  timestamp: string
}

export interface StatusEvent {
  value: string
  source: string
  checkedAt: string
  classification?: string
}

/**
 * Find all messages that need status checking
 * Criteria:
 * - direction: outbound
 * - status: sending, sent, uncertain, queued, pending
 * - timestamp: within last 24 hours
 * - exclude: delivered, failed statuses
 */
export async function findMessagesNeedingCheck(
  supabase: SupabaseClient
): Promise<MessageToCheck[]> {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  console.log(`Looking for messages sent after ${twentyFourHoursAgo}`)

  // Query customer_conversations for messages with uncertain status
  const { data: conversations, error } = await supabase
    .from('customer_conversations')
    .select('id, user_id, customer_id, messages, updated_at')
    .gte('updated_at', twentyFourHoursAgo)

  if (error) {
    console.error('Error fetching conversations:', error)
    return []
  }

  if (!conversations || conversations.length === 0) {
    console.log('No recent conversations found')
    return []
  }

  const messagesToCheck: MessageToCheck[] = []

  // Extract messages with uncertain status
  for (const conv of conversations) {
    if (!Array.isArray(conv.messages)) continue

    conv.messages.forEach((msg: any, index: number) => {
      const isOutbound = msg.direction === 'outbound'
      const currentStatus = (msg.status || '').toLowerCase()
      
      // Check if status needs monitoring
      const needsCheck = ['sending', 'sent', 'uncertain', 'queued', 'pending'].includes(currentStatus)
      
      // Exclude already finalized statuses
      const isFinalized = ['delivered', 'failed', 'delivery_failed'].includes(currentStatus)
      
      // Check if message is recent (within 24 hours)
      const messageTime = new Date(msg.timestamp)
      const isRecent = messageTime > new Date(twentyFourHoursAgo)

      // Must have provider message ID to check with Telnyx
      const hasProviderId = msg.providerMessageId

      if (isOutbound && needsCheck && !isFinalized && isRecent && hasProviderId) {
        messagesToCheck.push({
          conversationId: conv.id,
          userId: conv.user_id,
          customerId: conv.customer_id,
          messageId: msg.id,
          messageIndex: index,
          providerMessageId: msg.providerMessageId,
          currentStatus: msg.status,
          timestamp: msg.timestamp,
        })
      }
    })
  }

  console.log(`Found ${messagesToCheck.length} messages needing status check`)

  return messagesToCheck
}

/**
 * Update message status in customer_conversations
 * Adds new status event to the statusDetails.events array
 */
export async function updateMessageStatus(
  supabase: SupabaseClient,
  conversationId: string,
  messageIndex: number,
  newStatus: string,
  statusEvent: StatusEvent
): Promise<boolean> {
  try {
    // Fetch current conversation
    const { data: conv, error: fetchError } = await supabase
      .from('customer_conversations')
      .select('messages')
      .eq('id', conversationId)
      .single()

    if (fetchError) {
      console.error(`Error fetching conversation ${conversationId}:`, fetchError)
      return false
    }

    if (!conv || !Array.isArray(conv.messages)) {
      console.error(`No messages array found for conversation ${conversationId}`)
      return false
    }

    if (messageIndex < 0 || messageIndex >= conv.messages.length) {
      console.error(`Invalid message index ${messageIndex} for conversation ${conversationId}`)
      return false
    }

    // Update specific message
    const updatedMessages = [...conv.messages]
    const currentMessage = updatedMessages[messageIndex]

    updatedMessages[messageIndex] = {
      ...currentMessage,
      status: newStatus.toLowerCase(),
      statusDetails: {
        ...currentMessage.statusDetails,
        events: [
          ...(currentMessage.statusDetails?.events || []),
          statusEvent,
        ],
      },
    }

    // Save back to database
    const { error: updateError } = await supabase
      .from('customer_conversations')
      .update({ 
        messages: updatedMessages,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    if (updateError) {
      console.error(`Error updating conversation ${conversationId}:`, updateError)
      return false
    }

    console.log(
      `Updated message ${messageIndex} in conversation ${conversationId}: ${currentMessage.status} → ${newStatus}`
    )

    return true
  } catch (error) {
    console.error(`Exception updating message status:`, error)
    return false
  }
}

/**
 * Determine classification based on status
 */
export function getStatusClassification(status: string): string {
  const lowerStatus = status.toLowerCase()

  if (['delivered'].includes(lowerStatus)) {
    return 'success'
  }

  if (['failed', 'delivery_failed', 'delivery_unconfirmed'].includes(lowerStatus)) {
    return 'failure'
  }

  if (['sent', 'sending'].includes(lowerStatus)) {
    return 'uncertain'
  }

  return 'uncertain'
}

import { supabase } from './supabase'

/**
 * Fetch all customer conversations for a user.
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export const getCustomerConversations = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required')
  }

  const { data, error } = await supabase
    .from('customer_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  if (error) {
    console.error('Error fetching conversations:', error.message)
    throw error
  }

  return data || []
}

/**
 * Ensure every customer has a conversation row (with empty messages).
 * @param {string} userId
 * @param {Array} customers
 */
export const ensureCustomerConversations = async (userId, customers = []) => {
  if (!userId) return
  if (!Array.isArray(customers) || customers.length === 0) return

  try {
    const { data: existingRows, error } = await supabase
      .from('customer_conversations')
      .select('customer_id, customer_name')
      .eq('user_id', userId)

    if (error) {
      throw error
    }

    const existingById = new Map(
      (existingRows || []).map((row) => [String(row.customer_id), row])
    )

    const rowsToInsert = []
    const nameUpdates = []

    customers.forEach((customer) => {
      if (customer?.id === undefined || customer?.id === null) return
      const customerId = String(customer.id)
      const existingRow = existingById.get(customerId)

      if (!existingRow) {
        rowsToInsert.push({
          user_id: userId,
          customer_id: customerId,
          customer_name: customer?.name || '',
          messages: [],
          last_message: null,
          last_message_at: null,
          unread_count: 0,
          status: 'open',
        })
      } else if (
        (customer?.name || '') &&
        (customer?.name || '') !== (existingRow.customer_name || '')
      ) {
        nameUpdates.push({
          customer_id: customerId,
          customer_name: customer.name,
        })
      }
    })

    if (rowsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('customer_conversations')
        .insert(rowsToInsert)

      if (insertError) {
        throw insertError
      }
    }

    if (nameUpdates.length > 0) {
      await Promise.all(
        nameUpdates.map((update) =>
          supabase
            .from('customer_conversations')
            .update({ customer_name: update.customer_name })
            .eq('user_id', userId)
            .eq('customer_id', update.customer_id)
        )
      )
    }
  } catch (error) {
    console.error('Error ensuring conversation rows:', error.message)
  }
}

export const deleteCustomerConversations = async (userId, customerIds = []) => {
  if (!userId) return
  if (!Array.isArray(customerIds) || customerIds.length === 0) return

  const ids = customerIds
    .filter((id) => id !== undefined && id !== null)
    .map((id) => String(id))

  if (ids.length === 0) return

  try {
    const { error } = await supabase
      .from('customer_conversations')
      .delete()
      .eq('user_id', userId)
      .in('customer_id', ids)

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error deleting conversation rows:', error.message)
  }
}

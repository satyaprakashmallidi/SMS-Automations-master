import { supabase } from './supabase'

export const sendDirectMessage = async ({ userId, customer, message }) => {
  if (!userId) {
    throw new Error('User ID is required to send a message')
  }
  if (!customer) {
    throw new Error('Customer is required to send a message')
  }
  if (!message || !message.trim()) {
    throw new Error('Message cannot be empty')
  }

  const { data, error } = await supabase.functions.invoke('send-direct-message', {
    body: {
      userId,
      customer,
      message,
    },
  })

  if (error) {
    throw error
  }

  return data
}

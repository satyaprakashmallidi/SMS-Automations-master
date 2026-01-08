import { supabase } from './supabase'

/**
 * Get user customers from Supabase
 * @param {string} userId - The user's ID from auth.users
 * @returns {Promise<Array>} Array of customer objects or empty array if not found
 */
export const getCustomers = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const { data, error } = await supabase
      .from('customers')
      .select('customers_data')
      .eq('user_id', userId)
      .single()

    if (error) {
      // If customers not found, create them
      if (error.code === 'PGRST116') {
        console.log('Customers not found, creating new row...')
        return await createCustomers(userId)
      }
      throw error
    }

    // Return the customers_data array (or empty array if null)
    return data?.customers_data || []
  } catch (error) {
    console.error('Error fetching customers:', error.message)
    throw error
  }
}

/**
 * Save user customers to Supabase
 * @param {string} userId - The user's ID from auth.users
 * @param {Array} customersArray - Array of customer objects to save
 * @returns {Promise<Array>} Updated customers array
 */
export const saveCustomers = async (userId, customersArray) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    if (!Array.isArray(customersArray)) {
      throw new Error('Customers must be an array')
    }

    const { data, error } = await supabase
      .from('customers')
      .update({ customers_data: customersArray })
      .eq('user_id', userId)
      .select('customers_data')
      .single()

    if (error) throw error

    return data?.customers_data || []
  } catch (error) {
    console.error('Error saving customers:', error.message)
    throw error
  }
}

/**
 * Create empty customers row for a new user (fallback)
 * @param {string} userId - The user's ID from auth.users
 * @returns {Promise<Array>} Empty customers array
 */
export const createCustomers = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const { data, error } = await supabase
      .from('customers')
      .insert([{ user_id: userId, customers_data: [] }])
      .select('customers_data')
      .single()

    if (error) throw error

    return data?.customers_data || []
  } catch (error) {
    console.error('Error creating customers:', error.message)
    throw error
  }
}

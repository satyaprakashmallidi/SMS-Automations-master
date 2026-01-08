import { supabase } from './supabase'

/**
 * Get user templates from Supabase
 * @param {string} userId - The user's ID from auth.users
 * @returns {Promise<Array>} Array of template objects or empty array if not found
 */
export const getTemplates = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const { data, error } = await supabase
      .from('templates')
      .select('templates_data')
      .eq('user_id', userId)
      .single()

    if (error) {
      // If templates not found, create them
      if (error.code === 'PGRST116') {
        console.log('Templates not found, creating new row...')
        return await createTemplates(userId)
      }
      throw error
    }

    // Return the templates_data array (or empty array if null)
    return data?.templates_data || []
  } catch (error) {
    console.error('Error fetching templates:', error.message)
    throw error
  }
}

/**
 * Save user templates to Supabase
 * @param {string} userId - The user's ID from auth.users
 * @param {Array} templatesArray - Array of template objects to save
 * @returns {Promise<Array>} Updated templates array
 */
export const saveTemplates = async (userId, templatesArray) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    if (!Array.isArray(templatesArray)) {
      throw new Error('Templates must be an array')
    }

    const { data, error } = await supabase
      .from('templates')
      .update({ templates_data: templatesArray })
      .eq('user_id', userId)
      .select('templates_data')
      .single()

    if (error) throw error

    return data?.templates_data || []
  } catch (error) {
    console.error('Error saving templates:', error.message)
    throw error
  }
}

/**
 * Create empty templates row for a new user (fallback)
 * @param {string} userId - The user's ID from auth.users
 * @returns {Promise<Array>} Empty templates array
 */
export const createTemplates = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const { data, error } = await supabase
      .from('templates')
      .insert([{ user_id: userId, templates_data: [] }])
      .select('templates_data')
      .single()

    if (error) throw error

    return data?.templates_data || []
  } catch (error) {
    console.error('Error creating templates:', error.message)
    throw error
  }
}

import { supabase } from './supabase'

/**
 * Get user tags from Supabase
 * @param {string} userId - The user's ID from auth.users
 * @returns {Promise<Array>} Array of tag objects or empty array if not found
 */
export const getTags = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const { data, error } = await supabase
      .from('tags')
      .select('tags_data')
      .eq('user_id', userId)
      .single()

    if (error) {
      // If tags not found, create them
      if (error.code === 'PGRST116') {
        console.log('Tags not found, creating new row...')
        return await createTags(userId)
      }
      throw error
    }

    // Return the tags_data array (or empty array if null)
    return data?.tags_data || []
  } catch (error) {
    console.error('Error fetching tags:', error.message)
    throw error
  }
}

/**
 * Save user tags to Supabase
 * @param {string} userId - The user's ID from auth.users
 * @param {Array} tagsArray - Array of tag objects to save
 * @returns {Promise<Array>} Updated tags array
 */
export const saveTags = async (userId, tagsArray) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    if (!Array.isArray(tagsArray)) {
      throw new Error('Tags must be an array')
    }

    const { data, error } = await supabase
      .from('tags')
      .update({ tags_data: tagsArray })
      .eq('user_id', userId)
      .select('tags_data')
      .single()

    if (error) throw error

    return data?.tags_data || []
  } catch (error) {
    console.error('Error saving tags:', error.message)
    throw error
  }
}

/**
 * Create empty tags row for a new user (fallback)
 * @param {string} userId - The user's ID from auth.users
 * @returns {Promise<Array>} Empty tags array
 */
export const createTags = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const { data, error } = await supabase
      .from('tags')
      .insert([{ user_id: userId, tags_data: [] }])
      .select('tags_data')
      .single()

    if (error) throw error

    return data?.tags_data || []
  } catch (error) {
    console.error('Error creating tags:', error.message)
    throw error
  }
}

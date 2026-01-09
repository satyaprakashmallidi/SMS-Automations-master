import { supabase } from './supabase'

/**
 * Get user settings from Supabase
 * @param {string} userId - The user's ID from auth.users
 * @returns {Promise<Object>} User settings object or null if not found
 */
export const getSettings = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      // If settings not found, create them
      if (error.code === 'PGRST116') {
        console.log('Settings not found, creating new row...')
        return await createSettings(userId)
      }
      throw error
    }

    return convertSnakeToCamel(data)
  } catch (error) {
    console.error('Error fetching settings:', error.message)
    throw error
  }
}

/**
 * Update user settings in Supabase
 * @param {string} userId - The user's ID from auth.users
 * @param {Object} data - Settings data to update
 * @returns {Promise<Object>} Updated settings object
 */
export const updateSettings = async (userId, data) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Convert camelCase to snake_case for database
    const dbData = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      // phone: data.phone,  // REMOVED: phone is default and cannot be changed
      company_name: data.companyName,
      business_address: data.businessAddress,
      business_phone: data.businessPhone,
      website: data.website,
      timezone: data.timezone,
      sender_name: data.senderName,
      default_signature: data.defaultSignature,
    }

    // Remove undefined values to avoid overwriting with null
    Object.keys(dbData).forEach(
      key => dbData[key] === undefined && delete dbData[key]
    )

    const { data: updatedData, error } = await supabase
      .from('settings')
      .update(dbData)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error

    return convertSnakeToCamel(updatedData)
  } catch (error) {
    console.error('Error updating settings:', error.message)
    throw error
  }
}

/**
 * Create settings for a new user
 * @param {string} userId - The user's ID from auth.users
 * @returns {Promise<Object>} Created settings object
 */
export const createSettings = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const { data, error } = await supabase
      .from('settings')
      .insert([{ user_id: userId }])
      .select()
      .single()

    if (error) throw error

    return convertSnakeToCamel(data)
  } catch (error) {
    console.error('Error creating settings:', error.message)
    throw error
  }
}

/**
 * Convert snake_case database fields to camelCase for JavaScript
 * @param {Object} data - Data with snake_case keys
 * @returns {Object} Data with camelCase keys
 */
const convertSnakeToCamel = (data) => {
  if (!data) return data

  return {
    id: data.id,
    userId: data.user_id,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    phone: data.phone,
    companyName: data.company_name,
    businessAddress: data.business_address,
    businessPhone: data.business_phone,
    website: data.website,
    timezone: data.timezone,
    senderName: data.sender_name,
    defaultSignature: data.default_signature,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

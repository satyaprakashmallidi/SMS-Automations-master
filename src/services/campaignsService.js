import { supabase } from './supabase'

/**
 * Map database row to frontend campaign shape
 * @param {Object} row
 * @returns {Object}
 */
const mapDbToCampaign = (row) => {
  if (!row) return null

  const customers = row.customers || []
  const sentCustomers = row.sent_customers || []
  const deliveredCustomers = row.delivered_customers || []
  const failedCustomers = row.failed_customers || []

  const recipientCount = customers.length
  const sentCount = row.sent_count ?? sentCustomers.length
  const deliveredCount = row.delivered_count ?? deliveredCustomers.length
  const failedCount = row.failed_count ?? failedCustomers.length
  const uncertainCount = failedCustomers.filter(
    (customer) => (customer?.status || '').toLowerCase() === 'uncertain'
  ).length

  const successRate =
    sentCount > 0 ? Number(((deliveredCount / sentCount) * 100).toFixed(1)) : 0

  const costEstimation =
    typeof row.cost_estimation === 'number'
      ? row.cost_estimation
      : row.cost_estimation !== null && row.cost_estimation !== undefined
        ? Number(row.cost_estimation)
        : null

  const actualCost =
    typeof row.actual_cost === 'number'
      ? row.actual_cost
      : row.actual_cost !== null && row.actual_cost !== undefined
        ? Number(row.actual_cost)
        : null

  return {
    id: row.id,
    campaignId: row.campaign_id || row.id,
    userId: row.user_id,
    name: row.name,
    status: row.status,
    type: row.campaign_type,
    templateId: row.template_id || null,
    message: row.message,
    audienceFilters: {
      customerType: row.customer_type,
      lastBookingFilter: row.last_booking_filter,
      tagFilters: row.tag_filters || {
        includeAny: [],
        requireAll: [],
        exclude: [],
      },
    },
    customers,
    costEstimation,
    actualCost,
    recipientIds: customers.map((c) => c.id).filter(Boolean),
    recipientCount,
    sentCount,
    sentCustomers,
    deliveredCount,
    deliveredCustomers,
    uncertainCount,
    failedCount,
    failedCustomers,
    successRate,
    scheduledFor: row.scheduled_for,
    sentAt: row.sent_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by || null,
  }
}

/**
 * Map frontend campaign to database payload (snake_case)
 * @param {Object} campaign
 * @returns {Object}
 */
const mapCampaignToDb = (campaign) => {
  if (!campaign) return {}

  const audience = campaign.audienceFilters || {}
  const tagFilters =
    audience.tagFilters || { includeAny: [], requireAll: [], exclude: [] }

  const payload = {
    name: campaign.name,
    campaign_type: campaign.type || 'one_time',
    customer_type: audience.customerType || '',
    last_booking_filter:
      audience.lastBookingFilter === undefined
        ? null
        : audience.lastBookingFilter,
    tag_filters: tagFilters,
    customers: campaign.customers || [],
    cost_estimation:
      campaign.costEstimation === undefined
        ? null
        : campaign.costEstimation,
    message: campaign.message,
    status: campaign.status || 'draft',
    scheduled_for: campaign.scheduledFor || null,
    sent_at: campaign.sentAt || null,
    sent_count: campaign.sentCount ?? 0,
    sent_customers: campaign.sentCustomers || [],
    delivered_count: campaign.deliveredCount ?? 0,
    delivered_customers: campaign.deliveredCustomers || [],
    failed_count: campaign.failedCount ?? 0,
    failed_customers: campaign.failedCustomers || [],
  }

  if (campaign.actualCost !== undefined) {
    payload.actual_cost = campaign.actualCost
  }

  return payload
}

/**
 * Get all campaigns for a user
 * @param {string} userId - The user's ID from auth.users
 * @returns {Promise<Array>} Array of campaign objects
 */
export const getCampaigns = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(mapDbToCampaign)
  } catch (error) {
    console.error('Error fetching campaigns:', error.message)
    throw error
  }
}

/**
 * Create a new campaign for a user
 * @param {string} userId
 * @param {Object} campaign
 * @returns {Promise<Object>} Created campaign object
 */
export const createCampaign = async (userId, campaign) => {
  try {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const payload = {
      user_id: userId,
      ...mapCampaignToDb(campaign),
    }

    const { data, error } = await supabase
      .from('campaigns')
      .insert([payload])
      .select('*')
      .single()

    if (error) throw error

    return mapDbToCampaign(data)
  } catch (error) {
    console.error('Error creating campaign:', error.message)
    throw error
  }
}

/**
 * Update an existing campaign
 * @param {string} userId
 * @param {string} campaignId
 * @param {Object} campaign
 * @returns {Promise<Object>} Updated campaign object
 */
export const updateCampaign = async (userId, campaignId, campaign) => {
  try {
    if (!userId || !campaignId) {
      throw new Error('User ID and campaign ID are required')
    }

    const payload = mapCampaignToDb(campaign)

    const { data, error } = await supabase
      .from('campaigns')
      .update(payload)
      .eq('user_id', userId)
      .eq('id', campaignId)
      .select('*')
      .single()

    if (error) throw error

    return mapDbToCampaign(data)
  } catch (error) {
    console.error('Error updating campaign:', error.message)
    throw error
  }
}

/**
 * Delete a campaign
 * @param {string} userId
 * @param {string} campaignId
 * @returns {Promise<void>}
 */
export const deleteCampaign = async (userId, campaignId) => {
  try {
    if (!userId || !campaignId) {
      throw new Error('User ID and campaign ID are required')
    }

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('user_id', userId)
      .eq('id', campaignId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting campaign:', error.message)
    throw error
  }
}

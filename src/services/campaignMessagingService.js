import { supabase } from './supabase'

/**
 * Trigger backend sending of a campaign's messages.
 * This calls a Supabase Edge Function named "send-campaign"
 * which is responsible for talking to the Telnyx API.
 *
 * @param {Object} campaign - Campaign object including customers and message
 * @returns {Promise<{
 *   sentCustomers: Array,
 *   deliveredCustomers?: Array,
 *   failedCustomers: Array,
 *   uncertainCustomers?: Array,
 *   totalCost: number | null
 * }>}
 */
export const sendCampaignMessages = async (campaign) => {
  try {
    if (!campaign) {
      throw new Error('Campaign is required')
    }

    const customers = campaign.customers || []

    console.log('sendCampaignMessages: invoking send-campaign', {
      campaignId: campaign.id,
      customerCount: customers.length,
    })

    const { data, error } = await supabase.functions.invoke('send-campaign', {
      body: {
        campaignId: campaign.id,
        // Customers and message are also stored in Supabase; they are sent here
        // only for potential future use by the Edge Function.
        customers,
        message: campaign.message,
      },
    })

    if (error) throw error

    const result = {
      sentCustomers: data?.sentCustomers || [],
      deliveredCustomers: data?.deliveredCustomers || [],
      failedCustomers: data?.failedCustomers || [],
      uncertainCustomers: data?.uncertainCustomers || [],
      totalCost: typeof data?.totalCost === 'number' ? data.totalCost : null,
    }

    console.log('sendCampaignMessages: edge function result summary', {
      campaignId: campaign.id,
      sent: result.sentCustomers.length,
      delivered: result.deliveredCustomers.length,
      failed: result.failedCustomers.length,
      uncertain: result.uncertainCustomers.length,
      totalCost: result.totalCost,
    })

    return result
  } catch (error) {
    console.error('Error sending campaign messages:', error.message || error)
    throw error
  }
}

import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// SUPABASE_URL is provided automatically in the Edge Function environment.
// SERVICE_ROLE_KEY must be set via `supabase secrets set SERVICE_ROLE_KEY="..."`.
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') ?? ''

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase env vars for process-scheduled-campaigns function')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
})

serve(async (_req) => {
  try {
    const now = new Date().toISOString()

    // Find campaigns that are scheduled and due to run
    const { data: dueCampaigns, error } = await supabaseAdmin
      .from('campaigns')
      .select('id, status, scheduled_for')
      .eq('status', 'scheduled')
      .lte('scheduled_for', now)
      .limit(20)

    if (error) {
      console.error('process-scheduled-campaigns: error loading due campaigns', error)
      return new Response(JSON.stringify({ error: String(error) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!dueCampaigns || dueCampaigns.length === 0) {
      return new Response(JSON.stringify({ processed: [], message: 'No scheduled campaigns due' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    console.log('process-scheduled-campaigns: found due campaigns', {
      count: dueCampaigns.length,
      ids: dueCampaigns.map((c) => c.id),
    })

    const processedIds: string[] = []
    const errors: Array<{ id: string; error: string }> = []

    for (const campaign of dueCampaigns) {
      const campaignId = campaign.id as string

      try {
        const nowIso = new Date().toISOString()

        // Mark as active to avoid double-processing in overlapping runs
        const { error: updateError } = await supabaseAdmin
          .from('campaigns')
          .update({
            status: 'active',
            sent_at: nowIso,
          })
          .eq('id', campaignId)
          .eq('status', 'scheduled')

        if (updateError) {
          console.error('process-scheduled-campaigns: failed to mark campaign active', {
            campaignId,
            error: updateError,
          })
          errors.push({ id: campaignId, error: String(updateError) })
          continue
        }

        // Trigger the existing send-campaign function to do the actual Telnyx work
        const { error: functionError } = await supabaseAdmin.functions.invoke('send-campaign', {
          body: { campaignId },
        })

        if (functionError) {
          console.error('process-scheduled-campaigns: send-campaign error', {
            campaignId,
            error: functionError,
          })
          errors.push({ id: campaignId, error: String(functionError) })
          continue
        }

        processedIds.push(campaignId)
      } catch (innerError) {
        console.error('process-scheduled-campaigns: unhandled error for campaign', {
          campaignId,
          error: innerError,
        })
        errors.push({ id: campaignId, error: String(innerError) })
      }
    }

    return new Response(
      JSON.stringify({
        processed: processedIds,
        errors,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('process-scheduled-campaigns: unhandled top-level error', error)

    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})


/**
 * Check Message Status Edge Function
 * 
 * Runs on a cron schedule (every hour) to check delivery status of outbound messages
 * that are stuck in uncertain/sent/sending states.
 * 
 * Updates customer_conversations.messages array with latest delivery status from Telnyx.
 * Stops checking messages after 24 hours or when they reach delivered/failed status.
 */

import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { checkMessageStatus } from './telnyxStatusPoller.ts'
import {
  findMessagesNeedingCheck,
  updateMessageStatus,
  getStatusClassification,
} from './messageStatusChecker.ts'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('='.repeat(60))
  console.log('Check Message Status - Started')
  console.log('Time:', new Date().toISOString())
  console.log('='.repeat(60))

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY')
    const telnyxApiKey = Deno.env.get('TELNYX_API_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!telnyxApiKey) {
      console.error('Missing TELNYX_API_KEY environment variable')
      return new Response(
        JSON.stringify({ error: 'Missing Telnyx API key' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    // Find messages needing status check
    const messages = await findMessagesNeedingCheck(supabase)

    if (messages.length === 0) {
      console.log('No messages need status checking at this time')
      return new Response(
        JSON.stringify({
          success: true,
          results: {
            checked: 0,
            updated: 0,
            errors: 0,
            skipped: 0,
          },
          message: 'No messages needing check',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`Processing ${messages.length} messages...`)

    const results = {
      checked: 0,
      updated: 0,
      errors: 0,
      skipped: 0,
    }

    // Check each message with Telnyx
    for (const msg of messages) {
      try {
        console.log(`\nChecking message ${msg.providerMessageId}`)
        console.log(`  Current status: ${msg.currentStatus}`)
        console.log(`  Conversation: ${msg.conversationId}`)
        console.log(`  Message index: ${msg.messageIndex}`)

        // Query Telnyx for current status
        const telnyxStatus = await checkMessageStatus(msg.providerMessageId, telnyxApiKey)

        results.checked++

        console.log(`  Telnyx status: ${telnyxStatus.status}`)

        // Only update if status changed
        if (telnyxStatus.status.toLowerCase() !== msg.currentStatus.toLowerCase()) {
          const statusEvent = {
            value: telnyxStatus.status,
            source: 'status-poll',
            checkedAt: new Date().toISOString(),
            classification: getStatusClassification(telnyxStatus.status),
          }

          const updated = await updateMessageStatus(
            supabase,
            msg.conversationId,
            msg.messageIndex,
            telnyxStatus.status,
            statusEvent
          )

          if (updated) {
            results.updated++
            console.log(`  ✓ Updated: ${msg.currentStatus} → ${telnyxStatus.status}`)
          } else {
            results.errors++
            console.log(`  ✗ Failed to update`)
          }
        } else {
          results.skipped++
          console.log(`  - No change (still ${msg.currentStatus})`)
        }

        // Add small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Error processing message ${msg.providerMessageId}:`, error)
        results.errors++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('Summary:')
    console.log(`  Messages checked: ${results.checked}`)
    console.log(`  Statuses updated: ${results.updated}`)
    console.log(`  No change: ${results.skipped}`)
    console.log(`  Errors: ${results.errors}`)
    console.log('='.repeat(60))

    return new Response(
      JSON.stringify({
        success: true,
        results,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Fatal error in check-message-status:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

-- ====================================================================
-- Recover Deleted Inbound Messages Script
-- ====================================================================
-- This script recovers inbound messages that were deleted due to the
-- customer_id mismatch issue (phone number vs numeric ID).
-- ====================================================================

-- Step 1: Find all inbound webhook events that were processed but not in conversations
WITH inbound_webhooks AS (
  SELECT DISTINCT ON (wl.message_id)
    wl.from_number,
    wl.to_number,
    wl.message_text,
    wl.message_id,
    wl.occurred_at,
    wl.raw_payload,
    wl.user_id
  FROM webhook_logs wl
  WHERE wl.event_type = 'message.received'
    AND wl.processed = true
    AND wl.from_number IS NOT NULL
  ORDER BY wl.message_id, wl.created_at DESC
),
-- Step 2: Match each webhook to a customer by phone number
matched_customers AS (
  SELECT 
    iw.*,
    c.user_id as customer_owner_id,
    customer_elem as customer_record
  FROM inbound_webhooks iw
  JOIN customers c ON c.user_id = iw.user_id
  CROSS JOIN LATERAL jsonb_array_elements(c.customers_data) as customer_elem
  WHERE customer_elem->>'phone' = iw.from_number
),
-- Step 3: Check which messages are missing from conversations
missing_messages AS (
  SELECT 
    mc.user_id,
    (mc.customer_record->>'id')::text as customer_id,
    mc.customer_record->>'name' as customer_name,
    mc.from_number,
    mc.message_text,
    mc.message_id,
    mc.occurred_at,
    mc.raw_payload,
    cc.messages
  FROM matched_customers mc
  LEFT JOIN customer_conversations cc 
    ON cc.user_id = mc.user_id 
    AND cc.customer_id = (mc.customer_record->>'id')::text
  WHERE NOT EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(COALESCE(cc.messages, '[]'::jsonb)) msg
    WHERE msg->>'providerMessageId' = mc.message_id
  )
)
-- Step 4: Display what will be recovered (run this first to preview)
SELECT 
  customer_id,
  customer_name,
  from_number,
  message_text,
  occurred_at as timestamp,
  'Will be added to conversation' as action
FROM missing_messages
ORDER BY occurred_at;

-- ====================================================================
-- UNCOMMENT THE SECTION BELOW TO ACTUALLY PERFORM THE RECOVERY
-- ====================================================================

/*
-- Step 5: Actually insert the missing messages
WITH inbound_webhooks AS (
  SELECT DISTINCT ON (wl.message_id)
    wl.from_number,
    wl.to_number,
    wl.message_text,
    wl.message_id,
    wl.occurred_at,
    wl.raw_payload,
    wl.user_id
  FROM webhook_logs wl
  WHERE wl.event_type = 'message.received'
    AND wl.processed = true
    AND wl.from_number IS NOT NULL
  ORDER BY wl.message_id, wl.created_at DESC
),
matched_customers AS (
  SELECT 
    iw.*,
    c.user_id as customer_owner_id,
    customer_elem as customer_record
  FROM inbound_webhooks iw
  JOIN customers c ON c.user_id = iw.user_id
  CROSS JOIN LATERAL jsonb_array_elements(c.customers_data) as customer_elem
  WHERE customer_elem->>'phone' = iw.from_number
),
missing_messages AS (
  SELECT 
    mc.user_id,
    (mc.customer_record->>'id')::text as customer_id,
    mc.customer_record->>'name' as customer_name,
    mc.from_number,
    mc.message_text,
    mc.message_id,
    mc.occurred_at,
    mc.raw_payload,
    cc.id as conversation_id,
    COALESCE(cc.messages, '[]'::jsonb) as existing_messages
  FROM matched_customers mc
  LEFT JOIN customer_conversations cc 
    ON cc.user_id = mc.user_id 
    AND cc.customer_id = (mc.customer_record->>'id')::text
  WHERE NOT EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(COALESCE(cc.messages, '[]'::jsonb)) msg
    WHERE msg->>'providerMessageId' = mc.message_id
  )
)
UPDATE customer_conversations cc
SET 
  messages = mm.existing_messages || jsonb_build_array(
    jsonb_build_object(
      'id', gen_random_uuid(),
      'direction', 'inbound',
      'content', mm.message_text,
      'status', 'webhook_delivered',
      'timestamp', mm.occurred_at,
      'providerMessageId', mm.message_id,
      'campaignId', 'direct-message',
      'statusDetails', jsonb_build_object(
        'provider', 'telnyx',
        'providerMessageId', mm.message_id,
        'events', jsonb_build_array(
          jsonb_build_object(
            'value', 'webhook_delivered',
            'source', 'webhook',
            'checkedAt', mm.occurred_at,
            'raw', mm.raw_payload
          )
        )
      )
    )
  ),
  last_message = mm.message_text,
  last_message_at = mm.occurred_at::timestamptz,
  unread_count = cc.unread_count + 1
FROM missing_messages mm
WHERE cc.id = mm.conversation_id
RETURNING 
  cc.customer_id,
  cc.customer_name,
  mm.message_text as recovered_message;
*/

-- ====================================================================
-- INSTRUCTIONS:
-- ====================================================================
-- 1. Run the script AS-IS first to see what messages will be recovered
-- 2. Review the results to ensure they look correct
-- 3. Uncomment the section between /* */ to actually perform recovery
-- 4. Run the uncommented version
-- 5. Refresh your Inbox page to see the recovered messages
-- ====================================================================

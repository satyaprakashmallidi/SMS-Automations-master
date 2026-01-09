-- ====================================================================
-- Supabase Webhook Logs Schema
-- ====================================================================
-- This table logs ALL incoming webhooks from Telnyx for debugging,
-- analytics, and tracking delivery status updates.
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.webhook_logs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Telnyx event metadata
  event_type TEXT NOT NULL,           -- e.g., "message.received", "message.sent", "message.delivered"
  event_id TEXT,                      -- Telnyx event ID
  occurred_at TIMESTAMPTZ,            -- When Telnyx says it happened

  -- Message details
  direction TEXT,                     -- "inbound" or "outbound"
  from_number TEXT,                   -- Sender phone number
  to_number TEXT,                     -- Recipient phone number
  message_text TEXT,                  -- SMS content
  message_id TEXT,                    -- Telnyx message ID
  status TEXT,                        -- e.g., "received", "sent", "delivered", "failed"

  -- Processing info
  processed BOOLEAN DEFAULT FALSE,    -- Did we route this to user inbox?
  user_id UUID,                       -- Which user this was routed to (if any)
  error_message TEXT,                 -- If processing failed, why?

  -- Raw webhook payload for debugging
  raw_payload JSONB NOT NULL,         -- Full JSON from Telnyx

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- Indexes for Performance
-- ====================================================================

-- Query by event type (e.g., find all message.received)
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type 
  ON public.webhook_logs(event_type);

-- Query by message ID (track a specific message through all events)
CREATE INDEX IF NOT EXISTS idx_webhook_logs_message_id 
  ON public.webhook_logs(message_id);

-- Query by phone numbers
CREATE INDEX IF NOT EXISTS idx_webhook_logs_from_number 
  ON public.webhook_logs(from_number);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_to_number 
  ON public.webhook_logs(to_number);

-- Query by time range
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at 
  ON public.webhook_logs(created_at DESC);

-- Query by processing status
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed 
  ON public.webhook_logs(processed);

-- ====================================================================
-- Row Level Security (RLS)
-- ====================================================================

-- Enable RLS
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (for edge functions)
CREATE POLICY "Service role full access"
  ON public.webhook_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can only view their own logs
CREATE POLICY "Users can view own logs"
  ON public.webhook_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ====================================================================
-- NOTES:
-- ====================================================================
-- 1. This table captures EVERY webhook from Telnyx
-- 2. Useful for debugging delivery issues
-- 3. Can track message lifecycle: sent → delivered/failed
-- 4. raw_payload stores the complete JSON for forensics
-- 5. Only message.received events get processed into inbox
-- 6. Service role (edge functions) can write; users can only read their own
-- ====================================================================

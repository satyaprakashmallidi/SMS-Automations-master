-- ====================================================================
-- Supabase Campaigns Table Schema
-- ====================================================================
-- This schema creates a Campaigns table with one row per campaign.
-- Each row is tied to a user (user_id) and stores:
-- - Campaign config (name, customer type, last booking filter, tag filters)
-- - Matched customers (JSON)
-- - Cost estimation
-- - Message
-- - Status + scheduling info
-- - Send/deliver/fail counts + customer JSON for each
--
-- Run this SQL in your Supabase SQL Editor.
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.campaigns (
  -- Primary Key (campaign ID)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key to auth.users (who owns this campaign)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- External campaign identifier (alias of primary key)
  campaign_id UUID GENERATED ALWAYS AS (id) STORED,

  -- =========================================================
  -- Step 1: Basic campaign information
  -- =========================================================

  -- Campaign name (from step 1)
  name TEXT NOT NULL,

  -- Campaign type: 'one_time' or 'recurring'
  campaign_type TEXT NOT NULL DEFAULT 'one_time',

  -- Template used (optional, from step 4)
  template_id UUID,

  -- Who created this campaign (optional display field)
  created_by TEXT,

  -- =========================================================
  -- Step 2: Audience filters (from "Target Audience" step)
  -- =========================================================

  -- Customer type: 'all', 'recurring', 'residential', 'all_including_inactive'
  customer_type TEXT NOT NULL,

  -- Last booking filter:
  -- e.g. '', 'within_30_days', 'within_60_days', 'within_90_days', 'more_than_90_days'
  last_booking_filter TEXT,

  -- Tag filters used to build the audience
  -- Structure:
  -- {
  --   "includeAny": [tagId, ...],
  --   "requireAll": [tagId, ...],
  --   "exclude":    [tagId, ...]
  -- }
  tag_filters JSONB NOT NULL DEFAULT
    '{"includeAny": [], "requireAll": [], "exclude": []}'::jsonb,

  -- =========================================================
  -- Step 3: Matched customers + cost
  -- =========================================================

  -- Customers that matched the audience filters for this campaign
  -- Stored as JSONB array of customer snapshots
  -- Example: [ { id, name, phone, ... }, ... ]
  customers JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Cost estimation for this campaign (e.g. number_of_customers * cost_per_sms)
  cost_estimation NUMERIC(10, 2),

  -- Actual cost charged by Telnyx after sending (sum of per-message costs)
  -- Stored with 6 decimal places for precise SMS pricing
  actual_cost NUMERIC(12, 6),

  -- =========================================================
  -- Step 4: Message content
  -- =========================================================

  -- Final SMS message from step 4
  message TEXT NOT NULL,

  -- =========================================================
  -- Status, scheduling, timeline
  -- =========================================================

  -- Campaign status:
  -- 'draft', 'scheduled', 'active', 'sent', 'failed'
  -- (In the UI you can show "Completed" for 'sent')
  status TEXT NOT NULL DEFAULT 'draft',

  -- When the campaign is scheduled to run (if scheduled)
  scheduled_for TIMESTAMPTZ,

  -- When the campaign was actually sent (for one-time sends)
  sent_at TIMESTAMPTZ,

  -- =========================================================
  -- Delivery metrics + per-status customer data
  -- =========================================================

  -- How many were successfully sent and their customer data
  sent_count INTEGER NOT NULL DEFAULT 0,
  sent_customers JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- How many were delivered and their customer data
  delivered_count INTEGER NOT NULL DEFAULT 0,
  delivered_customers JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- How many failed and their customer data
  failed_count INTEGER NOT NULL DEFAULT 0,
  failed_customers JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- =========================================================
  -- Timestamps
  -- =========================================================

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- Index for Performance
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id
  ON public.campaigns(user_id);

-- ====================================================================
-- Row Level Security (RLS) Policies
-- ====================================================================

-- Enable RLS on the campaigns table
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Users can view their own campaigns
CREATE POLICY "Users can view own campaigns"
  ON public.campaigns
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own campaigns
CREATE POLICY "Users can insert own campaigns"
  ON public.campaigns
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own campaigns
CREATE POLICY "Users can update own campaigns"
  ON public.campaigns
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own campaigns
CREATE POLICY "Users can delete own campaigns"
  ON public.campaigns
  FOR DELETE
  USING (auth.uid() = user_id);

-- ====================================================================
-- Trigger: Auto-update updated_at timestamp
-- ====================================================================

CREATE OR REPLACE FUNCTION update_campaigns_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_campaigns_updated_at_column();

-- ====================================================================
-- NOTES:
-- ====================================================================
-- 1. One row per campaign (many campaigns per user).
-- 2. "customers" column holds matched customers as JSONB array.
-- 3. sent_customers / delivered_customers / failed_customers are JSONB arrays
--    containing the customers in each outcome bucket.
-- 4. In Supabase JS you will use:
--    - supabase.from('campaigns').select('*').eq('user_id', userId)
--    - supabase.from('campaigns').insert([...])
--    - supabase.from('campaigns').update({...}).eq('id', campaignId)
-- ====================================================================

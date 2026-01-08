-- ====================================================================
-- Supabase Settings Table Schema
-- ====================================================================
-- This schema creates a Settings table to store user preferences
-- Run this SQL in your Supabase SQL Editor
-- ====================================================================

-- Create the Settings table
CREATE TABLE IF NOT EXISTS public.settings (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key to auth.users
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Account Tab Fields (4 fields) - All start as NULL
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,

  -- Company Tab Fields (4 fields) - All start as NULL
  company_name TEXT,
  business_address TEXT,
  business_phone TEXT,
  website TEXT,

  -- SMS Settings Tab Fields (3 fields) - All start as NULL
  timezone TEXT,
  sender_name TEXT,
  default_signature TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one settings record per user
  UNIQUE(user_id)
);

-- ====================================================================
-- Create Index for Performance
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON public.settings(user_id);

-- ====================================================================
-- Row Level Security (RLS) Policies
-- ====================================================================

-- Enable RLS on the settings table
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own settings
CREATE POLICY "Users can view own settings"
  ON public.settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own settings
CREATE POLICY "Users can insert own settings"
  ON public.settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own settings
CREATE POLICY "Users can update own settings"
  ON public.settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own settings
CREATE POLICY "Users can delete own settings"
  ON public.settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- ====================================================================
-- Trigger: Auto-update updated_at timestamp
-- ====================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- Function: Create empty settings row for new users
-- ====================================================================
-- Automatically creates an empty settings record when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Automatically create settings when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- NOTES:
-- ====================================================================
-- 1. An empty settings row is automatically created for each new user
-- 2. All fields (except user_id and timestamps) are NULL by default
-- 3. Users fill out the fields themselves through the settings forms
-- 4. Each user can only have one settings record (UNIQUE constraint)
-- 5. RLS ensures users can only access their own settings
-- 6. updated_at timestamp is automatically updated on every change
-- ====================================================================


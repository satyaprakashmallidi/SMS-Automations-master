-- ====================================================================
-- Supabase Templates Table Schema
-- ====================================================================
-- This schema creates a Templates table to store user templates as a JSON array
-- One row per user, all templates stored in JSONB column
-- Run this SQL in your Supabase SQL Editor
-- ====================================================================

-- Create the Templates table
CREATE TABLE IF NOT EXISTS public.templates (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key to auth.users
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Templates data stored as JSONB array
  -- Structure: [{ id, name, category, message, tags, characterCount, createdAt, updatedAt }, ...]
  templates_data JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one templates record per user
  UNIQUE(user_id)
);

-- ====================================================================
-- Create Index for Performance
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON public.templates(user_id);

-- ====================================================================
-- Row Level Security (RLS) Policies
-- ====================================================================

-- Enable RLS on the templates table
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own templates
CREATE POLICY "Users can view own templates"
  ON public.templates
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own templates
CREATE POLICY "Users can insert own templates"
  ON public.templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own templates
CREATE POLICY "Users can update own templates"
  ON public.templates
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own templates
CREATE POLICY "Users can delete own templates"
  ON public.templates
  FOR DELETE
  USING (auth.uid() = user_id);

-- ====================================================================
-- Trigger: Auto-update updated_at timestamp
-- ====================================================================
CREATE OR REPLACE FUNCTION update_templates_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION update_templates_updated_at_column();

-- ====================================================================
-- Function: Create empty templates row for new users
-- ====================================================================
-- Automatically creates an empty templates record when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_templates()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.templates (user_id, templates_data)
  VALUES (NEW.id, '[]'::jsonb);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Automatically create templates when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created_templates ON auth.users;
CREATE TRIGGER on_auth_user_created_templates
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_templates();

-- ====================================================================
-- NOTES:
-- ====================================================================
-- 1. An empty templates row is automatically created for each new user
-- 2. templates_data column stores templates as JSONB array (default: [])
-- 3. Each template in the array has: id, name, category, message, tags, characterCount, createdAt, updatedAt
-- 4. Each user can only have one templates record (UNIQUE constraint on user_id)
-- 5. RLS ensures users can only access their own templates
-- 6. updated_at timestamp is automatically updated on every change
-- 7. To fetch templates: SELECT templates_data FROM templates WHERE user_id = userId
-- 8. To add/update templates: UPDATE templates SET templates_data = newArray WHERE user_id = userId
-- ====================================================================


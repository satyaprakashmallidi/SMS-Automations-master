-- ====================================================================
-- Supabase Tags Table Schema
-- ====================================================================
-- This schema creates a Tags table to store user tags as a JSON array
-- One row per user, all tags stored in JSONB column
-- Run this SQL in your Supabase SQL Editor
-- ====================================================================

-- Create the Tags table
CREATE TABLE IF NOT EXISTS public.tags (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key to auth.users
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tags data stored as JSONB array
  -- Structure: [{ id, name, type, color, icon, definition, trigger, createdAt, updatedAt }, ...]
  tags_data JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one tags record per user
  UNIQUE(user_id)
);

-- ====================================================================
-- Create Index for Performance
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON public.tags(user_id);

-- ====================================================================
-- Row Level Security (RLS) Policies
-- ====================================================================

-- Enable RLS on the tags table
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own tags
CREATE POLICY "Users can view own tags"
  ON public.tags
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own tags
CREATE POLICY "Users can insert own tags"
  ON public.tags
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own tags
CREATE POLICY "Users can update own tags"
  ON public.tags
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own tags
CREATE POLICY "Users can delete own tags"
  ON public.tags
  FOR DELETE
  USING (auth.uid() = user_id);

-- ====================================================================
-- Trigger: Auto-update updated_at timestamp
-- ====================================================================
CREATE OR REPLACE FUNCTION update_tags_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON public.tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tags_updated_at_column();

-- ====================================================================
-- Function: Create empty tags row for new users
-- ====================================================================
-- Automatically creates an empty tags record when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_tags()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.tags (user_id, tags_data)
  VALUES (NEW.id, '[]'::jsonb);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Automatically create tags when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created_tags ON auth.users;
CREATE TRIGGER on_auth_user_created_tags
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_tags();

-- ====================================================================
-- NOTES:
-- ====================================================================
-- 1. An empty tags row is automatically created for each new user
-- 2. tags_data column stores tags as JSONB array (default: [])
-- 3. Each tag in the array has: id, name, type, color, icon, definition, trigger, createdAt, updatedAt
-- 4. Each user can only have one tags record (UNIQUE constraint on user_id)
-- 5. RLS ensures users can only access their own tags
-- 6. updated_at timestamp is automatically updated on every change
-- 7. To fetch tags: SELECT tags_data FROM tags WHERE user_id = userId
-- 8. To add/update tags: UPDATE tags SET tags_data = newArray WHERE user_id = userId
-- ====================================================================

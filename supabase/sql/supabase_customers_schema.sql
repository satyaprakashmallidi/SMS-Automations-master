-- ====================================================================
-- Supabase Customers Table Schema
-- ====================================================================
-- This schema creates a Customers table to store user customers as a JSON array
-- One row per user, all customers stored in JSONB column
-- Run this SQL in your Supabase SQL Editor
-- ====================================================================

-- Create the Customers table
CREATE TABLE IF NOT EXISTS public.customers (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Key to auth.users
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Customers data stored as JSONB array
  -- Structure: [{ id, name, phone, email, status, type, lastService, address, totalSpent, tags, createdAt, updatedAt }, ...]
  customers_data JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one customers record per user
  UNIQUE(user_id)
);

-- ====================================================================
-- Create Index for Performance
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);

-- ====================================================================
-- Row Level Security (RLS) Policies
-- ====================================================================

-- Enable RLS on the customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own customers
CREATE POLICY "Users can view own customers"
  ON public.customers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own customers
CREATE POLICY "Users can insert own customers"
  ON public.customers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own customers
CREATE POLICY "Users can update own customers"
  ON public.customers
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own customers
CREATE POLICY "Users can delete own customers"
  ON public.customers
  FOR DELETE
  USING (auth.uid() = user_id);

-- ====================================================================
-- Trigger: Auto-update updated_at timestamp
-- ====================================================================
CREATE OR REPLACE FUNCTION update_customers_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at_column();

-- ====================================================================
-- Function: Create empty customers row for new users
-- ====================================================================
-- Automatically creates an empty customers record when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_customers()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customers (user_id, customers_data)
  VALUES (NEW.id, '[]'::jsonb);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Automatically create customers when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created_customers ON auth.users;
CREATE TRIGGER on_auth_user_created_customers
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_customers();

-- ====================================================================
-- NOTES:
-- ====================================================================
-- 1. An empty customers row is automatically created for each new user
-- 2. customers_data column stores customers as JSONB array (default: [])
-- 3. Each customer in the array has: id, name, phone, email, status, type, lastService, address, totalSpent, tags, createdAt, updatedAt
-- 4. Each user can only have one customers record (UNIQUE constraint on user_id)
-- 5. RLS ensures users can only access their own customers
-- 6. updated_at timestamp is automatically updated on every change
-- 7. To fetch customers: SELECT customers_data FROM customers WHERE user_id = userId
-- 8. To add/update customers: UPDATE customers SET customers_data = newArray WHERE user_id = userId
-- ====================================================================


-- ====================================================================
-- Supabase Customer Conversations Schema
-- ====================================================================
-- This table stores one row per (user_id, customer_id) pair so the inbox
-- can show every customer and the history of outbound/inbound messages.
-- Messages are stored as a JSONB array so we can append new records when
-- campaigns send or inbound replies arrive.
-- ====================================================================

create table if not exists public.customer_conversations (
  id uuid primary key default gen_random_uuid(),

  -- Auth owner of the customer list
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Customer identifier from customers_data JSON (stored as text to
  -- support numeric or string ids)
  customer_id text not null,

  -- Snapshot of the customer name for easier querying/filtering
  customer_name text,

  -- JSONB array of message objects. Each entry should look like:
  -- {
  --   "id": "uuid-or-snowflake",
  --   "direction": "outbound" | "inbound",
  --   "content": "SMS text body",
  --   "status": "queued" | "sent" | "delivered" | "failed",
  --   "providerMessageId": "telnyx-id",
  --   "campaignId": "uuid",
  --   "timestamp": "2025-12-04T15:30:00.000Z"
  -- }
  messages jsonb not null default '[]'::jsonb,

  -- Convenience fields for inbox previews
  last_message text,
  last_message_at timestamptz,
  unread_count integer not null default 0,
  status text not null default 'open',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, customer_id)
);

-- Helpful index for filtering by owner
create index if not exists idx_customer_conversations_user
  on public.customer_conversations(user_id);

-- Auto-update updated_at
create or replace function public.update_customer_conversations_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_customer_conversations_updated_at
  before update on public.customer_conversations
  for each row
  execute function public.update_customer_conversations_updated_at();

-- Enable RLS and add policies so every user can only see/manage their rows
alter table public.customer_conversations enable row level security;

create policy "Users can view own conversations"
  on public.customer_conversations
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own conversations"
  on public.customer_conversations
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on public.customer_conversations
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on public.customer_conversations
  for delete
  using (auth.uid() = user_id);

-- ====================================================================
-- NOTES:
-- - One row per customer per user.
-- - `messages` keeps the full SMS history for that customer.
-- - `last_message`/`last_message_at`/`unread_count` provide quick inbox
--   previews without scanning the JSON.
-- - When new customers are created, insert rows with empty `messages`.
-- - When campaigns send messages, append to `messages` and update the
--   preview fields.
-- ====================================================================

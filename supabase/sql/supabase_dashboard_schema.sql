-- ====================================================================
-- Supabase Dashboard Snapshot Schema
-- ====================================================================
-- Stores one analytics snapshot per user. Each row keeps the latest
-- dashboard metrics so the frontend can simply fetch a single record
-- (stats, weekly message counts, and recent campaign activity).
-- ====================================================================

create table if not exists public.dashboard (
  id uuid primary key default gen_random_uuid(),

  -- Auth owner (one row per user enforced via unique constraint)
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Cached stat cards (JSON object containing the values shown on the UI)
  metrics jsonb not null default '{}'::jsonb,

  -- Weekly chart data (array of { label, sent, delivered } objects)
  weekly_chart jsonb not null default '[]'::jsonb,

  -- Recent activity feed (array of campaign/message events)
  recent_activity jsonb not null default '[]'::jsonb,

  -- Optional window metadata so automation jobs know which week the data represents
  week_start date,
  week_end date,

  -- Refresh timestamps
  refreshed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id)
);

create index if not exists idx_dashboard_user_id
  on public.dashboard(user_id);

-- Maintain updated_at automatically
create or replace function public.update_dashboard_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_dashboard_updated_at
  before update on public.dashboard
  for each row
  execute function public.update_dashboard_updated_at();

-- Enable RLS so each user can only access their dashboard snapshot
alter table public.dashboard enable row level security;

create policy "Users can view own dashboard snapshot"
  on public.dashboard
  for select
  using (auth.uid() = user_id);

create policy "Users can upsert their dashboard snapshot"
  on public.dashboard
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their dashboard snapshot"
  on public.dashboard
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their dashboard snapshot"
  on public.dashboard
  for delete
  using (auth.uid() = user_id);

-- ====================================================================
-- NOTES:
-- - `metrics` should store the numbers shown on the stat cards
--   (total revenue, active customers, etc.).
-- - `weekly_chart` mirrors the chart on the dashboard (messages sent /
--   delivered grouped by day). Automation can refresh this weekly.
-- - `recent_activity` holds the latest campaign/message events so the
--   dashboard can render without multiple joins.
-- - Each user has exactly one row; upsert rather than insert duplicates.
-- ====================================================================

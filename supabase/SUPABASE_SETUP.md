# Supabase Setup & Automation Notes

This document summarizes all Supabase‑side configuration used by the project,
so future changes and new environments can be set up consistently.

---

## 1. Tables & Schemas

SQL schemas are stored under:

- `supabase/sql/supabase_customers_schema.sql`
- `supabase/sql/supabase_tags_schema.sql`
- `supabase/sql/supabase_templates_schema.sql`
- `supabase/sql/supabase_settings_schema.sql`
- `supabase/sql/supabase_campaigns_schema.sql`
- `supabase/sql/supabase_customer_conversations.sql`
- `supabase/sql/supabase_dashboard_schema.sql`

Run these files in the Supabase SQL editor to create the schema.

### Campaigns Table (key points)

From `supabase/sql/supabase_campaigns_schema.sql`:

- Primary key: `id uuid primary key default gen_random_uuid()`
- Alias column: `campaign_id uuid generated always as (id) stored`
- Scheduling fields:
  - `status text not null default 'draft'`
  - `scheduled_for timestamptz`
  - `sent_at timestamptz`
- Metrics:
  - `sent_count integer not null default 0`
  - `sent_customers jsonb not null default '[]'::jsonb`
  - `delivered_count integer not null default 0`
  - `delivered_customers jsonb not null default '[]'::jsonb`
  - `failed_count integer not null default 0`
  - `failed_customers jsonb not null default '[]'::jsonb`
- Cost fields:
  - `cost_estimation numeric(10, 2)`
  - `actual_cost numeric(12, 6)` – total Telnyx cost, summed in the Edge
    Function and stored with 6 decimal places.

If the database already exists, you can align it with:

```sql
alter table public.campaigns
  add column if not exists campaign_id uuid generated always as (id) stored;

alter table public.campaigns
  add column if not exists actual_cost numeric(12, 6);
```

---

### Webhook Logs Table

From `supabase/sql/supabase_webhook_logs_schema.sql`:

- Logs **every** webhook received from Telnyx (message.received, message.sent, message.delivered, message.finalized, etc.)
- Important columns:
  - `event_type` – Type of Telnyx event
  - `direction` – "inbound" or "outbound"
  - `from_number`, `to_number` – Phone numbers involved
  - `message_text` – SMS content
  - `message_id` – Telnyx message ID (for tracking lifecycle)
  - `status` – Message status (sent, delivered, failed, etc.)
  - `processed` – Whether this event was routed to user inbox
  - `user_id` – Which user this was routed to (if any)
  - `raw_payload` – Full JSON for debugging
- Use cases:
  - Debug webhook delivery issues
  - Track message lifecycle (sent → delivered/failed)
  - Analytics on message volume and delivery rates
  - Audit trail for compliance
- RLS: Service role can write; users can read their own logs

---

### Customer Conversations Table (Inbox backing store)

From `supabase/sql/supabase_customer_conversations.sql`:

- One row per `(user_id, customer_id)` so the Inbox always has a record for every customer.
- Important columns:
  - `messages jsonb not null default '[]'::jsonb` ƒ?" append message objects here.
  - `last_message text`, `last_message_at timestamptz`, `unread_count integer`.
  - `customer_name text` ƒ?" denormalized snapshot so Inbox can render without joining customers JSON.
- Constraints:
  - `unique (user_id, customer_id)` ensures exactly one row per customer per user.
- Triggers / policies:
  - `trg_customer_conversations_updated_at` keeps `updated_at` fresh.
  - RLS policies restrict access so each auth user can only see/manage their own rows.

Whenever customers are created/imported we insert missing conversation rows. The
`send-campaign` Edge Function appends outbound messages to `messages` so the
Inbox UI reflects real message history instead of mock data.

---

### Dashboard Snapshot Table

From `supabase/sql/supabase_dashboard_schema.sql`:

- Purpose: cache the dashboard stats, weekly chart data, and recent activity in
  a single row per user. Automation jobs can refresh this weekly so the UI can
  fetch it with a single query.
- Columns of interest:
  - `metrics jsonb` ƒ?" store totals such as total revenue, active customers, etc.
  - `weekly_chart jsonb` ƒ?" array of `{ label, sent, delivered }`.
  - `recent_activity jsonb` ƒ?" the recent campaign/message timeline.
  - `week_start`, `week_end`, `refreshed_at` to track the snapshot window.
  - `unique (user_id)` ensures a single row per auth user.
- RLS policies mirror the other tables (select/insert/update/delete restricted to `auth.uid()`).

This table does not drive the UI yet, but the schema is in place so we can begin
populating it (e.g., via cron) as soon as we want to persist dashboard data.

---

## 2. Edge Functions

Edge functions live under `supabase/functions`.

### 2.1 `send-campaign`

Path:

- `supabase/functions/send-campaign/index.ts`
- `supabase/functions/send-campaign/telnyxSendMessage.ts`
- `supabase/functions/send-campaign/telnyxFetchStatus.ts`

Purpose:

- Sends all messages for a campaign via Telnyx and polls delivery status.
- Writes back:
  - `sent_customers`, `sent_count`
  - `delivered_customers`, `delivered_count`
  - `failed_customers`, `failed_count`
  - `actual_cost` (sum of per‑message Telnyx costs)
  - `status = 'completed'`

Environment variables (Edge Function):

- `SUPABASE_URL` – provided automatically in the Edge environment.
- `SERVICE_ROLE_KEY` – must be set via Supabase secrets:
  - `npx supabase secrets set SERVICE_ROLE_KEY="<service_role_key>"`
- `TELNYX_API_KEY` – Telnyx secret:
  - `npx supabase secrets set TELNYX_API_KEY="<telnyx_api_key>"`
- `TELNYX_FROM_NUMBER` – sender number (optional, defaults to `+18334905225`):
  - `npx supabase secrets set TELNYX_FROM_NUMBER="+18334905225"`

### 2.2 `send-direct-message`

- Sends a single personalized SMS to one customer and records it in `customer_conversations`.

### 2.3 `inbound-message`

- Receives **ALL** Telnyx webhooks (24/7) for SMS events.
- Verifies the webhook signature using **Ed25519** with your Telnyx account Public Key (`TELNYX_PUBLIC_KEY`), pulled from Telnyx Mission Control → Account → Keys & Credentials → Public Key.
- **Logging:** Every webhook (message.received, message.sent, message.delivered, message.finalized, etc.) is logged to `webhook_logs` table for debugging and analytics.
- **Spam filtering:** Messages marked as `is_spam: true` by Telnyx are logged but NOT routed to inboxes (automatic spam protection).
- **Processing:** Only `message.received` events (inbound from customers) that are NOT spam are routed to user inboxes. All other events return 200 OK but are only logged.
- **Smart routing for shared numbers:**
  1. Searches `customers.customers_data` across all users to find existing customer relationship with the sender phone
  2. If found in **multiple users** (e.g., both Alice and Bob messaged this customer), routes message to **ALL matched users' inboxes** (duplicates the message)
  3. If found in **one user**, routes to that user's inbox
  4. If not found (new customer), routes to first user with matching `settings.phone` (Note: `business_phone` is NOT used for inbound routing)
- **Customer handling:**
  - If sender exists in `customers.customers_data`, uses that customer's name and info
  - If sender is NEW (inbound-only), creates conversation WITHOUT adding to `customers.customers_data`
  - Inbound-only contacts appear in Direct Messages/Inbox ONLY (not in Customers page)
  - When user manually adds them to Customers page, they become "full" customers with all fields
- Appends inbound entry to `customer_conversations` (increments `unread_count`), using phone number as `customer_id`.
- Response shape: 
  - For `message.received` (non-spam): `{ success: true, routedTo: 'existing' | 'primary', users: [{userId, customerId}], messageId, logged: true, processed: true }`
  - For spam messages: `{ success: true, logged: true, processed: false, filtered: true, reason: 'Message marked as spam by Telnyx' }`
  - For other events: `{ success: true, logged: true, processed: false, eventType, reason: '...' }`

Required secrets:

```bash
npx supabase secrets set SERVICE_ROLE_KEY="..."        # already required
npx supabase secrets set TELNYX_API_KEY="..."          # already required
npx supabase secrets set TELNYX_FROM_NUMBER="+1..."    # optional, sending only
npx supabase secrets set TELNYX_PUBLIC_KEY="..."       # Telnyx Ed25519 public key (keep trailing '=' if present)
```

Telnyx webhook endpoint (after deploy):

```
https://<your-project-ref>.supabase.co/functions/v1/inbound-message
```

Configure Telnyx Messaging webhook to POST to that URL and use your Telnyx **Public Key** for signature verification.

Key implementation details:

- `telnyxSendMessage.ts`:
  - Normalizes phone numbers to E.164 (e.g. `+1 202-614-6217` → `+12026146217`).
  - Calls `POST https://api.telnyx.com/v2/messages`.
- `telnyxFetchStatus.ts`:
  - Calls `GET https://api.telnyx.com/v2/messages/{id}`.
  - Classifies statuses into `success`, `failed`, `uncertain`, `queued`.
  - Extracts cost from multiple shapes (`cost.amount`, `cost.cost`, or `cost`).
- `index.ts`:
  - Marks campaign `active` and sets `sent_at`.
  - Sends each customer sequentially with a 0.5s delay (2 calls/sec).
  - Polls status and groups customers into delivered / failed / uncertain.
  - Accumulates `totalCost` and stores it in `campaigns.actual_cost`.
  - Sets `status = 'completed'`.
  - Looks up the owning user&rsquo;s `settings.default_signature` and, if present,
    appends it to the end of `campaign.message` before sending via Telnyx (so the
    signature is part of the text and contributes to SMS length/cost).

### Deploying `send-campaign`

```bash
npx supabase functions deploy send-campaign
```

---

## 3. Processing Scheduled Campaigns (Database Function + Cron)

Because Edge‑Function cron is not available on this project, scheduled
campaigns are processed using a **database function + `pg_cron`**, which then
invokes the `send-campaign` Edge Function.

### 3.1 Required extensions

Run once in the SQL editor:

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;
```

### 3.2 Store keys in DB settings

Run once (and again after rotation) with your real keys:

```sql
-- Service role key, used for database->Supabase client where needed
select set_config(
  'app.service_role_key',
  'YOUR_SERVICE_ROLE_KEY_HERE',
  true
);

-- Anon key, used when calling Edge Functions from the database via pg_net
select set_config(
  'app.functions_anon_key',
  'YOUR_ANON_KEY_HERE',
  true
);
```

### 3.3 Database function: `public.process_scheduled_campaigns`

SQL:

```sql
create or replace function public.process_scheduled_campaigns()
returns void as $$
declare
  c record;
  edge_url text := 'https://qgubnzlasbocmgxumjjy.supabase.co/functions/v1/send-campaign';
  functions_anon_key text := current_setting('app.functions_anon_key', true);
begin
  -- Loop through all due scheduled campaigns
  for c in
    select id
    from public.campaigns
    where status = 'scheduled'
      and scheduled_for <= now()
  loop
    -- Mark the campaign as active to avoid double-processing
    update public.campaigns
    set status = 'active',
        sent_at = now()
    where id = c.id
      and status = 'scheduled';

    -- Call the Edge Function that actually sends messages via Telnyx.
    -- We disable JWT verification for this function and authenticate via the anon key.
    perform net.http_post(
      url := edge_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', functions_anon_key
      ),
      body := jsonb_build_object('campaignId', c.id),
      timeout_milliseconds := 60000
    );
  end loop;
end;
$$ language plpgsql security definer;
```

Behavior:

- Picks up campaigns where:
  - `status = 'scheduled'`
  - `scheduled_for <= now()`
- Sets them `active` + `sent_at = now()`.
- Calls the `send-campaign` Edge Function for each campaign, which handles
  Telnyx sending, status polling, and completion.

### 3.4 Cron schedule via `pg_cron`

Attach a cron job (example: every minute):

```sql
select cron.schedule(
  'run_scheduled_campaigns',          -- job name
  '* * * * *',                        -- schedule (every minute)
  $$select public.process_scheduled_campaigns();$$
);
```

To inspect cron jobs:

```sql
select * from cron.job;
```

With this in place:

- UI saves scheduled campaigns with `status = 'scheduled'` and
  `scheduled_for = <ISO datetime>`.
- `pg_cron` runs `process_scheduled_campaigns()` on the chosen schedule.
- The DB function triggers the `send-campaign` Edge Function, so scheduled
  campaigns start and complete automatically, even if no user is online.

---

## 4. Frontend Expectations

The frontend expects the following fields on a campaign object (from
`mapDbToCampaign` in `src/services/campaignsService.js`):

- `id` – primary key in `campaigns`.
- `campaignId` – alias, mapped from `campaign_id` (or falls back to `id`).
- `status` – one of `draft | scheduled | active | completed | sent`.
- `scheduledFor` – from `scheduled_for`.
- `sentAt` – from `sent_at`.
- `costEstimation` – from `cost_estimation`.
- `actualCost` – from `actual_cost`.
- Delivery metrics and customer arrays as described above.

UI surfaces:

- Campaign ID on cards and in the details modal.
- Estimated and actual cost on cards and in the completed details modal.

---

## 5. Secrets Summary

Supabase **Edge Function secrets**:

- `SERVICE_ROLE_KEY`
- `TELNYX_API_KEY`
- `TELNYX_FROM_NUMBER`

Database **runtime setting** for cron function:

- `app.service_role_key` – set via `set_config` as shown above, used by
  `process_scheduled_campaigns` to authenticate to the Edge Function.




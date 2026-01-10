-- ====================================================================
-- Setup Cron Job for Message Status Checking
-- ====================================================================
-- This SQL script sets up a PostgreSQL cron job that triggers the
-- check-message-status edge function every hour.
--
-- Prerequisites:
-- 1. pg_cron extension must be enabled
-- 2. check-message-status edge function must be deployed
-- 3. Edge function must be publicly callable or use proper auth
-- ====================================================================

-- Enable pg_cron extension (requires superuser or admin privileges)
-- This may already be enabled in Supabase projects
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove existing cron job if it exists
SELECT cron.unschedule('check-message-status-hourly') 
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'check-message-status-hourly'
);

-- Schedule the cron job to run every hour
-- Cron format: minute hour day month weekday
-- '0 * * * *' = At minute 0 of every hour
SELECT cron.schedule(
  'check-message-status-hourly',  -- Job name
  '0 * * * *',                     -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
      url := 'https://qgubnzlasbocmgxumjjy.supabase.co/functions/v1/check-message-status',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFndWJuemxhc2JvY21neHVtamp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzOTE2ODYsImV4cCI6MjA3OTk2NzY4Nn0.uMNSHDwVELlJgeIfpeknlDMq3hiZByX8boZkr57WjiU'
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- ====================================================================
-- Alternative Schedule Examples:
-- ====================================================================

-- Run every 30 minutes:
-- SELECT cron.schedule('check-message-status-half-hourly', '*/30 * * * *', $$...$$);

-- Run every 15 minutes:
-- SELECT cron.schedule('check-message-status-quarter-hourly', '*/15 * * * *', $$...$$);

-- Run every 2 hours:
-- SELECT cron.schedule('check-message-status-two-hourly', '0 */2 * * *', $$...$$);

-- ====================================================================
-- Verify Cron Job is Scheduled:
-- ====================================================================
-- SELECT * FROM cron.job WHERE jobname = 'check-message-status-hourly';

-- ====================================================================
-- View Cron Job Run History:
-- ====================================================================
-- SELECT * FROM cron.job_run_details 
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-message-status-hourly')
-- ORDER BY start_time DESC
-- LIMIT 20;

-- ====================================================================
-- Manually Trigger the Cron Job (for testing):
-- ====================================================================
-- SELECT cron.schedule('check-message-status-test-run', 'now', $$
--   SELECT net.http_post(
--     url := 'https://<YOUR-PROJECT-REF>.supabase.co/functions/v1/check-message-status',
--     headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer <YOUR-KEY>'),
--     body := '{}'::jsonb
--   );
-- $$);

-- ====================================================================
-- Unschedule/Delete the Cron Job:
-- ====================================================================
-- SELECT cron.unschedule('check-message-status-hourly');

-- ====================================================================
-- SETUP INSTRUCTIONS:
-- ====================================================================
-- 1. Replace <YOUR-PROJECT-REF> with your actual Supabase project reference
--    Example: abcdefghijklmnop
--
-- 2. Replace <YOUR-ANON-KEY-OR-SERVICE-ROLE-KEY> with:
--    - Your anon key (if edge function allows anon access), OR
--    - Your service role key (more secure, recommended)
--
-- 3. Deploy the check-message-status edge function first:
--    supabase functions deploy check-message-status
--
-- 4. Set the TELNYX_API_KEY secret:
--    supabase secrets set TELNYX_API_KEY=your_api_key_here
--
-- 5. Run this SQL in your Supabase SQL Editor
--
-- 6. Verify it's scheduled by checking cron.job table
-- ====================================================================

# Message Status Checker - Deployment Guide

## Quick Start Checklist

- [ ] Deploy edge function
- [ ] Set TELNYX_API_KEY secret
- [ ] Setup cron job in database
- [ ] Test manually
- [ ] Verify first automated run

## Step-by-Step Deployment

### Step 1: Deploy the Edge Function

Navigate to your project root and deploy:

```bash
cd "E:\Github Projects\SMS-Automations-master"
supabase functions deploy check-message-status
```

**Expected output:**
```
Deploying check-message-status (project ref: your-project-ref)
Bundled check-message-status with deno in X ms.
check-message-status deployed successfully.
```

### Step 2: Set the TELNYX_API_KEY Secret

You need to add your Telnyx API key as a Supabase secret:

```bash
supabase secrets set TELNYX_API_KEY=KEY0123456789ABCDEF_youractualkey
```

**Get your Telnyx API key:**
1. Login to Telnyx Portal: https://portal.telnyx.com/
2. Go to API Keys section
3. Copy your V2 API Key (starts with `KEY`)

**Verify the secret is set:**
```bash
supabase secrets list
```

You should see:
```
TELNYX_API_KEY (set)
```

### Step 3: Setup Cron Job

1. **Get your project details:**
   - Project Reference: Found in Supabase Dashboard URL
   - Service Role Key: Settings → API → service_role key

2. **Edit the SQL file:**

   Open `supabase/sql/setup_message_status_cron.sql` and replace:
   
   - Line 38: `<YOUR-PROJECT-REF>` → Your actual project ref (e.g., `abcdefghijklmnop`)
   - Line 41: `<YOUR-ANON-KEY-OR-SERVICE-ROLE-KEY>` → Your service_role key

   Example:
   ```sql
   SELECT cron.schedule(
     'check-message-status-hourly',
     '0 * * * *',
     $$
     SELECT
       net.http_post(
         url := 'https://abcdefghijklmnop.supabase.co/functions/v1/check-message-status',
         headers := jsonb_build_object(
           'Content-Type', 'application/json',
           'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
         ),
         body := '{}'::jsonb
       ) as request_id;
     $$
   );
   ```

3. **Run the SQL:**
   - Open Supabase Dashboard → SQL Editor
   - Paste the edited SQL
   - Click "Run"

4. **Verify cron is scheduled:**
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'check-message-status-hourly';
   ```

   You should see one row with your job details.

### Step 4: Manual Test

Test the function before waiting for the cron:

```bash
curl -X POST https://YOUR-PROJECT-REF.supabase.co/functions/v1/check-message-status \
  -H "Authorization: Bearer YOUR-SERVICE-ROLE-KEY" \
  -H "Content-Type: application/json"
```

**Expected successful response:**
```json
{
  "success": true,
  "results": {
    "checked": 0,
    "updated": 0,
    "errors": 0,
    "skipped": 0
  },
  "message": "No messages needing check",
  "timestamp": "2026-01-10T12:00:00.000Z"
}
```

If you have messages that need checking:
```json
{
  "success": true,
  "results": {
    "checked": 5,
    "updated": 3,
    "errors": 0,
    "skipped": 2
  },
  "timestamp": "2026-01-10T12:00:00.000Z"
}
```

### Step 5: View Logs

Check the function execution logs:

```bash
supabase functions logs check-message-status --limit 50
```

Look for:
```
=============================================================
Check Message Status - Started
Time: 2026-01-10T12:00:00.000Z
=============================================================
Found X messages needing status check
Processing X messages...

Checking message msg_abc123...
  Current status: sending
  Telnyx status: delivered
  ✓ Updated: sending → delivered

Summary:
  Messages checked: 5
  Statuses updated: 3
  No change: 2
  Errors: 0
=============================================================
```

### Step 6: Verify Database Updates

Check that message statuses were updated:

```sql
SELECT 
  id,
  customer_id,
  messages->-1->>'text' as last_message_text,
  messages->-1->>'status' as status,
  jsonb_array_length(messages->-1->'statusDetails'->'events') as num_status_events,
  updated_at
FROM customer_conversations
WHERE (messages->-1->>'direction') = 'outbound'
  AND (messages->-1->>'status') IN ('sending', 'sent', 'uncertain', 'delivered')
ORDER BY updated_at DESC
LIMIT 10;
```

### Step 7: Monitor First Cron Run

The cron will first run at the top of the next hour (e.g., if it's 12:30pm, next run is 1:00pm).

**Check cron execution history:**
```sql
SELECT 
  runid,
  start_time,
  end_time,
  status,
  return_message
FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-message-status-hourly')
ORDER BY start_time DESC
LIMIT 10;
```

## Testing Scenarios

### Scenario 1: Test with a Message in "Sending" Status

1. Send a test message (creates message with initial status)
2. Wait 5 minutes
3. Manually trigger the checker:
   ```bash
   curl -X POST https://YOUR-PROJECT-REF.supabase.co/functions/v1/check-message-status \
     -H "Authorization: Bearer YOUR-KEY"
   ```
4. Check if status updated to `delivered` or `sent`

### Scenario 2: Test 24-Hour Cutoff

1. Find a message older than 24 hours:
   ```sql
   SELECT 
     id,
     messages->-1->>'timestamp' as timestamp,
     messages->-1->>'status' as status
   FROM customer_conversations
   WHERE (messages->-1->>'timestamp')::timestamptz < NOW() - INTERVAL '24 hours'
     AND (messages->-1->>'direction') = 'outbound'
   LIMIT 1;
   ```
2. Trigger checker - it should skip this message
3. Verify in logs: "Found 0 messages needing status check"

### Scenario 3: Test Already-Delivered Messages

1. Find a delivered message:
   ```sql
   SELECT id FROM customer_conversations
   WHERE (messages->-1->>'status') = 'delivered'
   LIMIT 1;
   ```
2. Trigger checker - should skip this message
3. Verify it's not checked (status remains same, no new events)

## Troubleshooting

### Error: "Missing TELNYX_API_KEY"

**Solution:**
```bash
supabase secrets set TELNYX_API_KEY=your_key_here
```

Then redeploy:
```bash
supabase functions deploy check-message-status
```

### Error: "Failed to fetch conversations"

**Check:**
1. Service role key is correct
2. Database permissions are correct
3. Table `customer_conversations` exists

### Cron not triggering

**Check:**
1. Is pg_cron enabled?
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_cron';
   ```
2. Is job scheduled?
   ```sql
   SELECT * FROM cron.job;
   ```
3. Check for errors:
   ```sql
   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
   ```

### Messages not updating

**Check:**
1. Do messages have `providerMessageId`?
   ```sql
   SELECT 
     COUNT(*) as total,
     COUNT(messages->-1->>'providerMessageId') as with_provider_id
   FROM customer_conversations;
   ```
2. Are messages within 24 hours?
3. Is Telnyx API key valid?

## Rollback

If you need to disable the system:

### 1. Unschedule cron job:
```sql
SELECT cron.unschedule('check-message-status-hourly');
```

### 2. Verify removal:
```sql
SELECT * FROM cron.job WHERE jobname = 'check-message-status-hourly';
-- Should return 0 rows
```

The edge function will remain deployed but won't be called automatically.

## Production Checklist

Before going live, verify:

- [ ] Edge function deploys successfully
- [ ] TELNYX_API_KEY is set correctly
- [ ] Manual test returns success
- [ ] Cron job is scheduled
- [ ] First automated run completes successfully
- [ ] Database updates are visible
- [ ] UI shows updated statuses
- [ ] Logs show no errors
- [ ] Telnyx API calls are working
- [ ] 24-hour cutoff is working correctly

## Monitoring Commands

### Check function health:
```bash
supabase functions logs check-message-status --limit 20
```

### Check cron history:
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'check-message-status-hourly')
ORDER BY start_time DESC
LIMIT 10;
```

### Check message status distribution:
```sql
WITH message_statuses AS (
  SELECT 
    jsonb_array_elements(messages)->>'status' as status,
    jsonb_array_elements(messages)->>'direction' as direction,
    (jsonb_array_elements(messages)->>'timestamp')::timestamptz as timestamp
  FROM customer_conversations
)
SELECT 
  status,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE timestamp > NOW() - INTERVAL '24 hours') as recent_count
FROM message_statuses
WHERE direction = 'outbound'
GROUP BY status
ORDER BY count DESC;
```

### Check recent updates:
```sql
SELECT 
  customer_id,
  messages->-1->>'status' as current_status,
  jsonb_array_length(messages->-1->'statusDetails'->'events') as event_count,
  messages->-1->'statusDetails'->'events'->-1->>'source' as last_check_source,
  messages->-1->'statusDetails'->'events'->-1->>'checkedAt' as last_check_time,
  updated_at
FROM customer_conversations
WHERE (messages->-1->>'direction') = 'outbound'
ORDER BY updated_at DESC
LIMIT 10;
```

## Next Steps

After successful deployment:

1. Monitor logs for the first 24 hours
2. Verify message statuses are updating correctly in UI
3. Check Telnyx API usage to ensure no rate limiting
4. Review cron history to confirm hourly runs
5. Adjust check frequency if needed (see documentation)

## Support

For detailed documentation, see: `MESSAGE_STATUS_CHECKER_DOCS.md`

For architecture details, see: `c:\Users\mspre\.cursor\plans\message_status_recheck_system_c55146ff.plan.md`

---

**Deployment Guide Version:** 1.0.0  
**Last Updated:** 2026-01-10

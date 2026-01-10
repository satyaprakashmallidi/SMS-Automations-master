# Quick Deployment Guide - Multi-User Inbound Routing

## ✅ Implementation Complete

All code changes have been successfully implemented and tested for syntax errors.

---

## 📋 What Was Changed

1. **Added `getAllUsers()` function** - Fetches all user accounts
2. **Updated fallback routing** - Routes unknown customers to ALL users
3. **Enhanced logging** - Better webhook response information

---

## 🚀 Deploy Now

Run this command to deploy the updated edge function:

```bash
supabase functions deploy inbound-message
```

**Expected Output:**
```
Deploying function inbound-message...
✓ Function deployed successfully
```

---

## 🧪 Quick Test

### Test 1: Known Customer (Saved by Multiple Users)

1. **Setup:**
   - Make sure at least 2 user accounts have the same customer saved
   - Example: Both User A and User B have "Rohan" with phone `+13029816191`

2. **Test:**
   - Send SMS from `+13029816191` to your business number
   - Message: "Test routing"

3. **Verify:**
   - Login as User A → Check Inbox → Should see "Test routing"
   - Login as User B → Check Inbox → Should see "Test routing"

✅ **Success:** Both users see the message in separate conversations

---

### Test 2: Unknown Customer

1. **Setup:**
   - Use a phone number NOT saved by any user
   - Example: `+19995551234`

2. **Test:**
   - Send SMS from `+19995551234` to your business number
   - Message: "Hello from unknown"

3. **Verify:**
   - Login to EACH user account in your system
   - Each should see new conversation: "Incoming +19995551234"
   - Each should see message: "Hello from unknown"

✅ **Success:** ALL users see the message as a new contact

---

## 📊 Monitor Logs

Watch the edge function logs in real-time:

```bash
supabase functions logs inbound-message --tail
```

**Expected for Known Customer:**
```json
{
  "routedTo": "matched-users",
  "userCount": 2,
  "note": "Message routed to 2 user(s) with this customer saved"
}
```

**Expected for Unknown Customer:**
```json
{
  "routedTo": "all-users",
  "note": "Unknown customer - routed to all users"
}
```

---

## 🔍 Verify Database

Check that messages were created:

```sql
-- See all recent inbound messages
SELECT 
  user_id,
  customer_id,
  customer_name,
  last_message,
  last_message_at
FROM customer_conversations
ORDER BY last_message_at DESC
LIMIT 10;
```

---

## ❓ Troubleshooting

### Issue: Message not showing up

**Check webhook logs:**
```sql
SELECT * FROM webhook_logs 
WHERE event_type = 'message.received' 
ORDER BY created_at DESC 
LIMIT 5;
```

**Check edge function logs:**
```bash
supabase functions logs inbound-message --limit 20
```

### Issue: Only one user receiving messages

**Verify customers are saved:**
```sql
SELECT 
  user_id,
  customer->>'name' as name,
  customer->>'phone' as phone
FROM customers
CROSS JOIN LATERAL jsonb_array_elements(customers_data) as customer
WHERE customer->>'phone' = '+13029816191';
```

Expected: Multiple rows (one per user who has that customer)

---

## 📚 Documentation

- **Full Testing Guide:** `MULTI_USER_ROUTING_TESTS.md`
- **Implementation Summary:** `MULTI_USER_ROUTING_SUMMARY.md`

---

## ✨ You're Ready!

The multi-user inbound routing is now implemented. Deploy and test to see it in action! 🎉

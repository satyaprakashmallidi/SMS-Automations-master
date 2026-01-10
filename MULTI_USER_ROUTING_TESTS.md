# Multi-User Inbound Routing - Testing Guide

## Deployment

Before testing, deploy the updated edge function:

```bash
supabase functions deploy inbound-message
```

---

## Test Scenario 1: Customer Saved by Multiple Users

### Prerequisites
1. Have at least 2 user accounts in your system
2. Both users should have the SAME customer saved (same phone number)
   - Example: User A has "Rohan Gilkes" with phone `+13029816191`
   - Example: User B also has "Rohan Gilkes" with phone `+13029816191`

### Test Steps

1. **Send Test SMS**
   - From phone `+13029816191`, send an SMS to your business number
   - Message: "Test multi-user routing"

2. **Verify User A's Inbox**
   - Login as User A
   - Go to Inbox page
   - Click on "Rohan Gilkes" conversation
   - Expected: You should see the message "Test multi-user routing" as a gray bubble on the left

3. **Verify User B's Inbox**
   - Login as User B
   - Go to Inbox page
   - Click on "Rohan Gilkes" conversation
   - Expected: You should also see the message "Test multi-user routing" as a gray bubble on the left

4. **Verify Independence**
   - As User A, reply with "Response from User A"
   - As User B, check their inbox
   - Expected: User B should NOT see User A's reply
   - As User B, reply with "Response from User B"
   - As User A, check their inbox
   - Expected: User A should NOT see User B's reply

### SQL Verification

```sql
-- Check that message was created in both users' conversations
SELECT 
  user_id,
  customer_id,
  customer_name,
  jsonb_array_length(messages) as message_count,
  last_message
FROM customer_conversations
WHERE customer_id IN (
  SELECT (customer->>'id')::text
  FROM customers
  CROSS JOIN LATERAL jsonb_array_elements(customers_data) as customer
  WHERE customer->>'phone' = '+13029816191'
)
ORDER BY user_id;
```

Expected: 2+ rows (one for each user who has Rohan saved)

---

## Test Scenario 2: Unknown Customer Number

### Prerequisites
1. Have at least 2 user accounts in your system
2. Use a phone number that is NOT saved by ANY user
   - Example: `+19995551234` (not in anyone's customer list)

### Test Steps

1. **Send Test SMS from Unknown Number**
   - From phone `+19995551234`, send an SMS to your business number
   - Message: "Hello from unknown number"

2. **Verify User A's Inbox**
   - Login as User A
   - Go to Inbox page
   - Expected: You should see a new conversation with "Incoming +19995551234"
   - Click on it
   - Expected: Message "Hello from unknown number" appears as gray bubble on left

3. **Verify User B's Inbox**
   - Login as User B
   - Go to Inbox page
   - Expected: You should ALSO see a new conversation with "Incoming +19995551234"
   - Click on it
   - Expected: Message "Hello from unknown number" appears as gray bubble on left

4. **Verify ALL Users Received It**
   - Login to each user account in your system
   - Each should have the new conversation with the message

### SQL Verification

```sql
-- Check that message was created for ALL users
SELECT 
  user_id,
  customer_id,
  customer_name,
  jsonb_array_length(messages) as message_count,
  last_message
FROM customer_conversations
WHERE customer_id = '+19995551234'
ORDER BY user_id;
```

Expected: Number of rows = number of users in your system

---

## Test Scenario 3: Verify Webhook Response

### Test Steps

1. **Monitor Edge Function Logs**
   ```bash
   supabase functions logs inbound-message --tail
   ```

2. **Send Test SMS from Known Customer**
   - Expected log response:
   ```json
   {
     "success": true,
     "routedTo": "matched-users",
     "users": [
       { "userId": "user-a-id", "customerId": "1767720734128" },
       { "userId": "user-b-id", "customerId": "1767720734129" }
     ],
     "userCount": 2,
     "messageId": "...",
     "logged": true,
     "processed": true,
     "note": "Message routed to 2 user(s) with this customer saved"
   }
   ```

3. **Send Test SMS from Unknown Customer**
   - Expected log response:
   ```json
   {
     "success": true,
     "routedTo": "all-users",
     "users": [
       { "userId": "user-a-id", "customerId": "+19995551234" },
       { "userId": "user-b-id", "customerId": "+19995551234" },
       { "userId": "user-c-id", "customerId": "+19995551234" }
     ],
     "messageId": "...",
     "logged": true,
     "processed": true,
     "note": "Unknown customer - routed to all users"
   }
   ```

---

## Troubleshooting

### Issue: Message not appearing in inbox

**Check webhook logs:**
```sql
SELECT * FROM webhook_logs 
WHERE event_type = 'message.received' 
ORDER BY created_at DESC 
LIMIT 5;
```

Expected: `processed: true` for recent messages

**Check edge function logs:**
```bash
supabase functions logs inbound-message --limit 20
```

Look for errors or routing information.

### Issue: Message only appears for one user

**Verify customer data:**
```sql
-- Check if customer is saved by multiple users
SELECT 
  user_id,
  jsonb_array_length(customers_data) as customer_count
FROM customers;

-- Check specific phone number
SELECT 
  user_id,
  customer->>'name' as customer_name,
  customer->>'phone' as phone
FROM customers
CROSS JOIN LATERAL jsonb_array_elements(customers_data) as customer
WHERE customer->>'phone' = '+13029816191';
```

Expected: Multiple rows if customer is saved by multiple users

### Issue: Unknown customer not routing to all users

**Check user count:**
```sql
SELECT COUNT(*) as user_count FROM settings;
```

**Check edge function getAllUsers():**
Look in logs for "failed to load all users" error

---

## Expected Behavior Summary

| Scenario | Routing Behavior | Independence |
|----------|------------------|--------------|
| Customer saved by User A only | Routes to User A only | N/A (single user) |
| Customer saved by User A and User B | Routes to BOTH User A and User B | Each has separate conversation |
| Customer saved by NO users | Routes to ALL users in system | Each has separate conversation |
| User A replies to customer | Appears only in User A's conversation | User B does NOT see User A's reply |

---

## Success Criteria

✅ Multiple users with same customer saved → All receive inbound messages
✅ Unknown customer → All users receive inbound messages
✅ Each user has independent conversation history
✅ Replies from one user don't appear in other users' conversations
✅ Webhook logs show correct routing information
✅ Edge function logs show successful multi-user routing

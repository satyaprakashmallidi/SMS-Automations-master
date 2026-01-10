# Inbound Message Customer ID Fix

## Problem Summary

Inbound messages (like "Hola") were not appearing in the Inbox UI, even though they were successfully stored in the database.

### Root Cause

The webhook and frontend used **different identifiers** for the same customer:

- **Webhook (`inbound-message`)**: Used **phone number** as `customer_id` (e.g., `"+13029816191"`)
- **Frontend (`InboxPage.jsx`)**: Expected **numeric customer ID** (e.g., `"1767720734128"`)

This created **duplicate conversations**:
1. Conversation with `customer_id: "+13029816191"` - Created by webhook, contained "Hola"
2. Conversation with `customer_id: "1767720734128"` - Created by `ensureCustomerConversations`, empty

The frontend's orphan cleanup logic then **deleted** the phone-based conversation because it didn't match any customer ID in the `customers_data` array.

---

## Solution Applied

Updated `supabase/functions/inbound-message/index.ts` to:

### 1. Lookup Customer Numeric ID
When an inbound message arrives, the webhook now:
- Calls `findExistingCustomer()` to search the `customers_data` array by phone number
- Extracts the customer's numeric `id` field if found
- Uses this numeric ID as the `customer_id` for the conversation

### 2. Updated Function Signature
Modified `appendConversationMessage()` to accept both:
- `customerId` (numeric ID from customers_data, if exists)
- `customerPhone` (fallback for unknown contacts)

```typescript
const appendConversationMessage = async ({
  userId,
  customerId,        // NEW: Numeric ID
  customerPhone,     // Fallback
  // ... other params
}) => {
  // Use customer ID if provided, otherwise use phone number
  const conversationId = customerId || normalizePhoneNumber(customerPhone)
  // ...
}
```

### 3. Updated Both Call Sites
- Primary user route (line 519-535)
- Matched users route (line 566-590)

Both now extract `customerId` from the customer object and pass it to `appendConversationMessage`.

---

## What This Fixes

✅ **Inbound messages now use the correct customer ID**
✅ **No more duplicate conversations**
✅ **Frontend won't delete inbound-only conversations**
✅ **Inbox UI displays both inbound and outbound messages together**

---

## Deployment Steps

### 1. Deploy the Updated Edge Function

```bash
supabase functions deploy inbound-message
```

### 2. Test with a Real Inbound Message

Have a customer text your business number, then verify:

```sql
-- Check that the conversation uses numeric customer ID
SELECT 
  customer_id,
  customer_name,
  jsonb_array_length(messages) as message_count,
  last_message
FROM customer_conversations
WHERE user_id = 'YOUR_USER_ID'
ORDER BY last_message_at DESC
LIMIT 5;
```

The `customer_id` should now be a numeric ID like `"1767720734128"`, not a phone number.

### 3. Verify in UI

1. Open **Inbox** page
2. Click on the customer who sent the message
3. You should see the inbound message (gray bubble, left side)

---

## Edge Cases Handled

### Case 1: Unknown Customer (Not in customers_data)
If someone texts you who isn't in your customer list:
- `findExistingCustomer()` returns `null`
- `customerId` is `null`
- Falls back to using `phone number` as `customer_id`
- Creates conversation with phone-based ID
- Frontend creates a fallback customer object for display

### Case 2: Customer Added After First Text
1. Customer texts you (not in list) → creates phone-based conversation
2. You add them to Customers page → creates numeric ID
3. They text again → webhook finds them, uses numeric ID
4. **Result**: Two separate conversations (old phone-based, new ID-based)

**Note**: This edge case still exists. To fully resolve it, you'd need a migration script to merge conversations when a phone-based conversation gets a matching customer added.

---

## Testing Checklist

- [x] Deploy updated function
- [ ] Send test inbound SMS
- [ ] Verify conversation created with numeric ID
- [ ] Check Inbox UI shows the message
- [ ] Reply to the message
- [ ] Verify reply appears in same conversation
- [ ] Check both messages have correct direction (inbound gray, outbound blue)

---

## Related Files Changed

1. `supabase/functions/inbound-message/index.ts` - Main fix
2. `src/pages/InboxPage.jsx` - Removed debug logging

---

## Questions or Issues?

If inbound messages still don't appear:

1. **Check customer exists in database:**
   ```sql
   SELECT customers_data FROM customers WHERE user_id = 'YOUR_USER_ID';
   ```

2. **Check webhook logs:**
   ```sql
   SELECT * FROM webhook_logs 
   WHERE event_type = 'message.received' 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

3. **Check edge function logs:**
   ```bash
   supabase functions logs inbound-message --tail
   ```

4. **Manually trigger test:**
   Send a test SMS and watch the logs in real-time to see if the customer lookup succeeds.

# Testing the Workflow System

This guide will help you test the subscription reminder workflow that uses Upstash QStash.

## How the Workflow Works

1. **Trigger**: When you create a subscription, it automatically triggers a QStash workflow
2. **Scheduling**: The workflow schedules email reminders at:
   - 7 days before renewal
   - 5 days before renewal
   - 2 days before renewal
   - 1 day before renewal
3. **Execution**: On each scheduled date, QStash calls your workflow endpoint and sends an email

## Testing Steps

### Step 1: Get Authentication Token

First, you need to sign up or sign in to get a JWT token.

**Sign Up:**

```bash
curl -X POST https://subscriptions-tracker.fly.dev/api/v1/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

**Or Sign In:**

```bash
curl -X POST https://subscriptions-tracker.fly.dev/api/v1/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

**Save the token** from the response (it will be in `data.token`).

### Step 2: Create a Test Subscription

Create a subscription with a renewal date in the **near future** for testing (e.g., 1-2 days from now).

**Important**: For testing, set a renewal date that's soon so you don't have to wait 7 days!

```bash
curl -X POST https://subscriptions-tracker.fly.dev/api/v1/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Netflix Premium",
    "price": 15.99,
    "frequency": "monthly",
    "category": "entertainment",
    "paymentMethod": "Credit Card ending in 1234",
    "startDate": "2025-01-01",
    "renewalDate": "2025-01-08"
  }'
```

**Note**: Replace `YOUR_TOKEN_HERE` with the token from Step 1, and adjust `renewalDate` to be 1-2 days from now for quick testing.

### Step 3: Check the Response

The response should include a `workflowRunId` if the workflow was triggered successfully:

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Netflix Premium",
    ...
  },
  "workflowRunId": "wr_xxxxx"
}
```

If you see `workflowRunId`, the workflow was triggered! ✅

### Step 4: Monitor Workflow Execution

#### Option A: Check Fly.io Logs

```bash
fly logs -a subscriptions-tracker
```

You should see logs like:

- "Sleeping until Reminder X days before reminder at..."
- "Triggering X days before reminder"
- Email sending logs

#### Option B: Check Upstash Dashboard

1. Go to https://console.upstash.com/
2. Navigate to **QStash** → **Workflows**
3. You should see your workflow run with status "Running" or "Completed"
4. Click on it to see execution details

### Step 5: Test Immediate Reminder (Optional)

If you want to test the email sending immediately without waiting, you can:

1. Create a subscription with `renewalDate` set to **tomorrow** or **today**
2. The workflow will check if any reminders should be sent immediately
3. Check your email inbox for the reminder

## Testing with Different Scenarios

### Test 1: Subscription with Renewal in 1 Day

- Should trigger workflow
- Should send "1 day before" reminder immediately (if renewal is tomorrow)

### Test 2: Subscription with Renewal in 3 Days

- Should trigger workflow
- Should schedule reminders for 2 days and 1 day before

### Test 3: Subscription with Renewal in 10 Days

- Should trigger workflow
- Should schedule all 4 reminders (7, 5, 2, 1 days before)

### Test 4: Cancelled Subscription

- Create subscription, then cancel it
- Workflow should stop (won't send reminders for inactive subscriptions)

## Troubleshooting

### No workflowRunId in Response

**Possible causes:**

1. QStash not configured properly
2. Check Fly.io logs for errors
3. Verify `QSTASH_URL` and `QSTASH_TOKEN` secrets are set

### Workflow Not Executing

1. **Check Upstash Dashboard**: See if workflow appears in QStash console
2. **Check SERVER_URL**: Must be your public Fly.io URL
3. **Check Logs**: `fly logs -a subscriptions-tracker`
4. **Verify Endpoint**: Make sure `/api/v1/workflows/subscription/reminder` is accessible

### Emails Not Sending

1. **Check EMAIL_PASSWORD**: Must be set correctly
2. **Check Email Logs**: Look for email sending errors in logs
3. **Verify User Email**: Make sure the user has a valid email address

## Quick Test Script

Here's a complete test script you can run:

```bash
# 1. Sign up
TOKEN=$(curl -s -X POST https://subscriptions-tracker.fly.dev/api/v1/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123"
  }' | jq -r '.data.token')

echo "Token: $TOKEN"

# 2. Create subscription (renewal in 2 days)
curl -X POST https://subscriptions-tracker.fly.dev/api/v1/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Subscription",
    "price": 9.99,
    "frequency": "monthly",
    "category": "entertainment",
    "paymentMethod": "Credit Card",
    "startDate": "2025-01-01",
    "renewalDate": "'$(date -d "+2 days" +%Y-%m-%d)'"
  }' | jq

# 3. Monitor logs
fly logs -a subscriptions-tracker
```

## Expected Behavior

✅ **Success Indicators:**

- Subscription created successfully
- `workflowRunId` in response
- Workflow appears in Upstash dashboard
- Logs show workflow scheduling reminders
- Emails sent on scheduled dates

❌ **Failure Indicators:**

- No `workflowRunId` in response
- Error messages in logs
- Workflow doesn't appear in Upstash dashboard
- Connection errors

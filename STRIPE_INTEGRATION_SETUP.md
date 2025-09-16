# AIDI Stripe Integration Setup Guide

## Overview
This guide walks you through setting up Stripe payment integration for the AIDI platform with the following pricing structure:
- **Index Pro**: £119/month (Professional tier)
- **Enterprise**: £319/month (Enterprise tier)

## Prerequisites
1. Stripe account (https://stripe.com)
2. Next.js application running
3. Database with user authentication

## Step 1: Stripe Dashboard Setup

### 1.1 Create Products and Prices
1. Log into your Stripe Dashboard
2. Go to **Products** → **Add Product**

**AIDI Index Pro:**
- Name: "AIDI Index Pro"
- Description: "Professional AI discoverability analysis with multi-model testing"
- Pricing: £119.00 GBP, Recurring monthly
- Copy the Price ID (starts with `price_`)

**AIDI Enterprise:**
- Name: "AIDI Enterprise" 
- Description: "Enterprise AI discoverability solution with custom integrations"
- Pricing: £319.00 GBP, Recurring monthly
- Copy the Price ID (starts with `price_`)

### 1.2 Configure Webhooks
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret (starts with `whsec_`)

### 1.3 Get API Keys
1. Go to **Developers** → **API Keys**
2. Copy your **Publishable key** (starts with `pk_`)
3. Copy your **Secret key** (starts with `sk_`)

## Step 2: Environment Configuration

Create a `.env.local` file with your Stripe credentials:

```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL=price_your_professional_price_id_here
NEXT_PUBLIC_STRIPE_PRICE_ID_ENTERPRISE=price_your_enterprise_price_id_here

# App URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Step 3: Database Migration

Run the database migration to add subscription tables:

```bash
npm run db:generate
npm run db:migrate
```

The migration adds:
- `stripeCustomerId` field to users table
- `subscriptions` table for tracking subscription status
- `payments` table for payment history

## Step 4: Testing the Integration

### 4.1 Test Cards
Use Stripe's test cards for testing:
- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

### 4.2 Test Flow
1. Navigate to `/evaluate` or `/leaderboards`
2. Click an upgrade button
3. Complete checkout with test card
4. Verify subscription in Stripe Dashboard
5. Check database for subscription record

## Step 5: Production Deployment

### 5.1 Switch to Live Mode
1. In Stripe Dashboard, toggle to **Live mode**
2. Create new products and prices (same as test)
3. Update environment variables with live keys
4. Update webhook endpoint to production URL

### 5.2 Webhook Security
Ensure your webhook endpoint:
- Validates the Stripe signature
- Returns 200 status for successful processing
- Handles idempotency for duplicate events

## API Endpoints

The integration includes these API routes:

### `/api/stripe/create-checkout-session`
- **Method**: POST
- **Purpose**: Creates Stripe checkout session
- **Body**: `{ priceId: string, tier: string }`
- **Returns**: `{ sessionId: string, url: string }`

### `/api/stripe/webhook`
- **Method**: POST
- **Purpose**: Handles Stripe webhook events
- **Validates**: Stripe signature
- **Updates**: Database subscription status

### `/api/stripe/customer-portal`
- **Method**: POST
- **Purpose**: Creates customer portal session
- **Returns**: `{ url: string }`

## Client-Side Integration

### Upgrade Buttons
Upgrade buttons use the `createCheckoutSession()` function:

```typescript
import { createCheckoutSession } from '@/lib/stripe-client'

// For Professional tier
await createCheckoutSession('professional')

// For Enterprise tier  
await createCheckoutSession('enterprise')
```

### Subscription Management
Enterprise customers can manage subscriptions via the customer portal:

```typescript
import { createCustomerPortalSession } from '@/lib/stripe-client'

await createCustomerPortalSession()
```

## Subscription Status

The system tracks subscription status and provides tier-based access:

- **Free**: Basic analysis with GPT-4 only
- **Professional**: Multi-model testing, leaderboard access
- **Enterprise**: All features plus custom integrations

## Security Considerations

1. **Environment Variables**: Never expose secret keys in client-side code
2. **Webhook Validation**: Always validate Stripe webhook signatures
3. **User Authentication**: Ensure users are authenticated before creating sessions
4. **Error Handling**: Gracefully handle payment failures and subscription changes

## Troubleshooting

### Common Issues

**Webhook not receiving events:**
- Check webhook URL is accessible
- Verify endpoint returns 200 status
- Check Stripe Dashboard webhook logs

**Checkout session creation fails:**
- Verify API keys are correct
- Check user authentication
- Ensure price IDs are valid

**Database errors:**
- Run database migrations
- Check database connection
- Verify schema matches expectations

### Logs and Monitoring

Monitor these areas:
- Stripe Dashboard webhook logs
- Application server logs
- Database query logs
- Client-side console errors

## Support

For issues with this integration:
1. Check Stripe Dashboard for webhook delivery status
2. Review application logs for errors
3. Test with Stripe's test cards
4. Consult Stripe documentation: https://stripe.com/docs
# AIDI Stripe Live Setup Guide

## Step 1: Get Your Price IDs

You provided product IDs, but I need the **price IDs** for the integration:

1. **Go to your Stripe Dashboard** → **Products**
2. **Click on "Index Pro" product** (prod_T48IduQpcy6Tx0)
3. **Copy the Price ID** (starts with `price_`) - this should be for £119/month
4. **Click on "Enterprise" product** (prod_T48JQldm55mrOx)  
5. **Copy the Price ID** (starts with `price_`) - this should be for £319/month

## Step 2: Get Your Secret Key

1. **Go to Stripe Dashboard** → **Developers** → **API Keys**
2. **Make sure you're in LIVE mode** (toggle in top left)
3. **Copy your "Secret key"** (starts with `sk_live_`)

## Step 3: Set Up Webhook Endpoint

1. **Go to Stripe Dashboard** → **Developers** → **Webhooks**
2. **Click "Add endpoint"**
3. **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
   - Replace `yourdomain.com` with your actual domain
   - For testing: `https://your-netlify-app.netlify.app/api/stripe/webhook`
4. **Select these events**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. **Click "Add endpoint"**
6. **Copy the "Signing secret"** (starts with `whsec_`)

## Step 4: What I Need From You

Please provide:

```
Index Pro Price ID: price_xxxxxxxxxxxxx
Enterprise Price ID: price_xxxxxxxxxxxxx
Secret Key: sk_live_xxxxxxxxxxxxx
Webhook Secret: whsec_xxxxxxxxxxxxx
Production Domain: https://yourdomain.com
```

## Step 5: I'll Configure Everything

Once you provide these details, I'll:

1. ✅ Create your `.env.local` file with live credentials
2. ✅ Update the Stripe configuration
3. ✅ Test the payment flow
4. ✅ Verify webhook integration
5. ✅ Deploy to production

## Important Notes

- **Keep your secret key secure** - never share it publicly
- **Test the webhook** after setup to ensure it receives events
- **Use your production domain** for the webhook URL
- **The webhook endpoint** `/api/stripe/webhook` is already implemented and ready

## Current Status

✅ **Stripe Integration Code**: Complete and ready
✅ **Database Schema**: Updated with subscription tables  
✅ **Upgrade Buttons**: Connected and functional
✅ **Your Products**: Created in Stripe dashboard
⏳ **Configuration**: Waiting for price IDs and credentials
⏳ **Webhook Setup**: Ready to configure with your domain
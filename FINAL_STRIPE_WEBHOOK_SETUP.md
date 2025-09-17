# Final Stripe Webhook Setup Instructions

## ✅ What's Complete

Your live Stripe integration is now configured with:

- ✅ **Live Publishable Key**: Configured
- ✅ **Live Secret Key**: Configured  
- ✅ **Price IDs**: Index Pro (£119) & Enterprise (£319)
- ✅ **Production Domain**: https://your-domain.netlify.app
- ✅ **Environment File**: `.env.production` created

## 🔧 Final Step: Webhook Setup

### 1. Create Webhook Endpoint in Stripe

1. **Go to your Stripe Dashboard** → **Developers** → **Webhooks**
2. **Click "Add endpoint"**
3. **Endpoint URL**: 
   ```
   https://your-domain.netlify.app/api/stripe/webhook
   ```
4. **Select these events**:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. **Click "Add endpoint"**

### 2. Get Webhook Signing Secret

1. **Click on your newly created webhook**
2. **Copy the "Signing secret"** (starts with `whsec_`)
3. **Add it to your environment variables**

### 3. Deploy to Production

1. **Add the webhook secret** to your Netlify environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

2. **Deploy your app** with the new environment variables

## 🧪 Testing Your Integration

### Test the Payment Flow

1. **Visit**: https://your-domain.netlify.app/evaluate
2. **Click**: "Upgrade to AIDI Index Pro - £119"
3. **Use Stripe test card**: 4242 4242 4242 4242
4. **Verify**: Checkout completes successfully

### Test the Webhook

1. **Make a test payment**
2. **Check Stripe Dashboard** → **Webhooks** → **Your endpoint**
3. **Verify**: Events are being received successfully
4. **Check your database**: Subscription records are created

## 🚀 Production Checklist

- [ ] Webhook endpoint created in Stripe
- [ ] Webhook signing secret added to environment variables
- [ ] App deployed to production with live credentials
- [ ] Test payment completed successfully
- [ ] Webhook events being received
- [ ] Database subscription records created
- [ ] Customer portal accessible for subscription management

## 🔒 Security Notes

- ✅ **Live credentials** are in `.env.production` (keep secure)
- ✅ **Webhook signature validation** implemented
- ✅ **Environment variables** properly configured
- ✅ **Database schema** ready for subscriptions

## 📞 Support

If you encounter any issues:

1. **Check Stripe Dashboard** → **Webhooks** for delivery status
2. **Check your app logs** for any errors
3. **Verify environment variables** are set correctly
4. **Test with Stripe test cards** before going live

Your AIDI platform is now ready for live payments! 🎉
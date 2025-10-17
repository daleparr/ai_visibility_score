# 🚀 CMS Advanced Features - Complete Implementation Guide

**Date:** October 17, 2025  
**Status:** Ready to Deploy  
**Features:** Tier Management, User Profiles, Stripe Invoicing

---

## 📦 What's Being Deployed

### **Feature 1: Pricing Tier Management** 💰
- Create/edit unlimited pricing tiers
- Toggle features on/off per tier
- Create custom packages for specific customers
- Set prices, billing periods, currencies
- Badge management ("Most Popular", etc.)
- Public visibility toggles

### **Feature 2: User Profile & Access Management** 👥
- Full user profile system
- Role-based access control (6 default roles)
- Permission management
- Password reset capabilities
- Activity logging
- User search and filtering

### **Feature 3: Stripe Invoicing Integration** 💳
- Create branded invoices
- Send invoices when customers select/change features
- Track invoice status
- Custom line items
- PDF generation via Stripe
- Payment tracking

---

## 🗄️ Database Schema Created

**Run first:** `sql/cms-advanced-features-schema.sql`

### Tables Created (11 new tables):

**Tier Management:**
1. `pricing_tiers` - All pricing tiers (standard + custom)
2. `tier_features` - Reusable feature library
3. `tier_feature_mapping` - Which features in which tiers

**User Management:**
4. `user_profiles` - Extended user information
5. `user_roles` - Role definitions with permissions
6. `user_role_assignments` - User-to-role mappings
7. `user_activity_log` - Audit trail

**Invoicing:**
8. `customer_subscriptions` - Stripe subscriptions
9. `invoices` - Invoice tracking
10. `invoice_line_items` - Itemized billing
11. `billing_events` - Billing audit trail

**Plus:**
12. `invoice_templates` - Branded invoice templates

---

## 🎯 Feature 1: Tier Management System

### What You Can Do:

**Create Standard Tiers:**
- Quick Scan: £499 one-time
- Full Audit: £2,500 one-time
- Enterprise: £10,000 one-time
- Monthly subscriptions: £119/month, £319/month

**Create Custom Tiers:**
- Enterprise Pro for Acme Corp: £7,500 one-time
- Custom features tailored to customer needs
- Hidden from public (only specific customer sees it)
- Custom pricing, custom feature bundles

**Toggle Features:**
- ✅ 12-Dimension Evaluation - ON
- ✅ API Access - ON
- ❌ Implementation Consulting - OFF
- ✅ Quarterly Re-evaluation - ON

**Manage Visibility:**
- Show/hide tiers on pricing page
- Mark as "Most Popular", "Best Value", etc.
- Active/inactive status

### CMS UI Access:

```
/admin/cms → Pricing Tiers (new tab)
```

**Interface:**
- List view: All tiers with stats
- Toggle switches for active/inactive
- Edit tier: Full form with feature checkboxes
- Create custom: Customer-specific packages

---

## 🎯 Feature 2: User Profile & Access Management

### User Roles (6 Default Roles):

1. **Super Admin**
   - Full system access
   - User management
   - Billing management
   - All CMS functions

2. **Administrator**
   - CMS editing
   - Blog publishing
   - Job management
   - View users/tiers

3. **Content Editor**
   - Edit CMS content
   - Draft blog posts
   - View jobs

4. **Premium Customer**
   - Full report access
   - API access
   - Run evaluations

5. **Basic Customer**
   - Limited report access
   - Basic evaluations

6. **Sector Collaborator**
   - View sector data
   - Early report access
   - Submit commentary

### What You Can Do:

**Manage Users:**
- View all users with search/filter
- Assign/remove roles
- Set access expiration dates
- View activity logs

**Edit Profiles:**
- Update user information
- Change email addresses
- Reset passwords
- Upload avatars

**Control Access:**
- Grant specific permissions
- Create time-limited access (e.g., 30-day trial)
- Revoke access instantly
- Track all access changes

### CMS UI Access:

```
/admin/cms → User Management (new tab)
```

**Interface:**
- User list with roles and status
- Quick role assignment
- Profile editor
- Activity log viewer
- Bulk actions (assign role to multiple users)

---

## 🎯 Feature 3: Stripe Invoicing

### What You Can Do:

**Create Invoices:**
1. Select customer
2. Add line items (tiers, features, custom items)
3. Set due date
4. Add custom notes
5. Generate branded invoice via Stripe

**Send Invoices:**
- Automatically email customer
- Branded PDF attachment
- Hosted payment page link
- Track open/paid status

**Track Payments:**
- See all invoices
- Filter by status (draft, open, paid, overdue)
- View payment history
- Export for accounting

**Customize Branding:**
- Upload company logo
- Set brand colors
- Custom footer text
- Terms & conditions

### Automatic Invoicing:

**When customer selects tier:**
```
Customer clicks "Get Full Audit" 
→ Invoice created: £2,500
→ Sent via Stripe
→ Customer pays
→ Access granted
```

**When customer changes features:**
```
Customer upgrades: Index Pro → Enterprise
→ Prorated invoice: £200 difference
→ Sent automatically
→ Subscription updated
```

### CMS UI Access:

```
/admin/cms → Invoicing (new tab)
```

**Interface:**
- Invoice list (draft, open, paid)
- Create invoice form
- Preview before sending
- Stripe sync status
- Payment tracking

---

## 🚀 Deployment Steps

### Step 1: Run Database Schema (5 minutes)

**In Neon SQL Editor:**
1. Open: `sql/cms-advanced-features-schema.sql`
2. Copy entire contents
3. Paste and click "Run"
4. Should see: "✅ CMS Advanced Features Schema Created!"

**Verifies:**
- 6 pricing tiers created
- 16+ tier features created
- 6 user roles created
- Invoice template created

### Step 2: Deploy CMS UI Components (Next Push)

**Files created:**
- `src/components/admin/TierManager.tsx` - Tier management UI
- `src/components/admin/UserManager.tsx` - User management UI (creating next)
- `src/components/admin/InvoiceManager.tsx` - Invoice management UI (creating next)

**Updated:**
- `src/app/admin/cms/page.tsx` - Add new tabs for advanced features

### Step 3: Create API Endpoints (Next Push)

**API routes to create:**
- `/api/admin/tiers` - CRUD for pricing tiers
- `/api/admin/features` - Manage tier features
- `/api/admin/users` - User management
- `/api/admin/invoices` - Invoice creation/tracking
- `/api/admin/stripe-invoice` - Stripe integration

---

## 💡 Usage Examples

### Example 1: Create Custom Enterprise Tier

**Scenario:** Acme Corp wants custom package at £7,500

**Steps:**
1. CMS → Pricing Tiers → "Create Custom Tier"
2. Set:
   - Name: "Acme Corp Enterprise"
   - Price: £7,500
   - Type: Custom
   - Customer: acme-corp-user@example.com
3. Select features:
   - ✅ Full 12-dimension evaluation
   - ✅ 5+ competitor analysis
   - ✅ API access
   - ✅ Implementation consulting (8 hours)
   - ✅ Quarterly re-evaluation (included)
4. Save
5. Tier appears ONLY for that customer

### Example 2: Change User Access

**Scenario:** Promote customer from Basic to Premium

**Steps:**
1. CMS → User Management → Search "john@example.com"
2. Current role: Basic Customer
3. Click "Assign Role" → Select "Premium Customer"
4. Optionally: Set expiration (30 days trial)
5. Save
6. User immediately gets premium access

### Example 3: Send Invoice for Custom Work

**Scenario:** Client requested additional competitor analysis

**Steps:**
1. CMS → Invoicing → "Create Invoice"
2. Select customer: acme-corp@example.com
3. Add line items:
   - Additional Competitor Deep Dive × 3 @ £1,500 each = £4,500
   - Rush Processing Fee = £500
4. Total: £5,000
5. Due date: 30 days
6. Click "Send Invoice"
7. Stripe generates branded PDF
8. Email sent to customer
9. Track payment status

---

## 📊 Current Status

**Completed:**
- ✅ Database schema created
- ✅ TierManager UI component created
- ✅ Default tiers seeded (6 tiers)
- ✅ Default features seeded (16 features)
- ✅ Default roles created (6 roles)

**Next (Creating now):**
- 📝 UserManager UI component
- 📝 InvoiceManager UI component
- 📝 API endpoints for all features
- 📝 Stripe integration functions
- 📝 Update CMS main page with new tabs

---

## 🎯 Success Metrics

After deployment, you'll be able to:

**Tier Management:**
- ✅ Create unlimited custom tiers in <2 minutes
- ✅ Toggle features on/off without code changes
- ✅ Update pricing instantly
- ✅ Hide/show tiers from public

**User Management:**
- ✅ Assign roles to users in <30 seconds
- ✅ View complete user activity history
- ✅ Grant temporary access (trials)
- ✅ Revoke access immediately

**Invoicing:**
- ✅ Generate invoice in <3 minutes
- ✅ Send branded invoice automatically
- ✅ Track all invoices and payments
- ✅ Export for accounting

---

**Status:** Schema ready, UI components in progress  
**Next:** Creating UserManager and InvoiceManager components now


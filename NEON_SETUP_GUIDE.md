# 🚀 Simplified Neon Database Setup Guide

## 📋 **Quick & Easy Setup (No OAuth Required)**

This guide will walk you through setting up Neon PostgreSQL database for your AI Visibility Score platform **without requiring Google OAuth setup**.

---

## **Step 1: Create Neon Account & Project**

### **1.1 Sign Up for Neon**
1. Go to [https://neon.tech/](https://neon.tech/)
2. Click **"Sign Up"**
3. Use any method (GitHub, Google, or email)
4. Complete account verification

### **1.2 Create New Project**
1. Once logged in, click **"Create Project"**
2. **Project Settings**:
   - **Name**: `ai-visibility-score`
   - **Region**: Choose closest to your users (e.g., `US East`, `EU West`)
   - **PostgreSQL Version**: `15` (recommended)
3. Click **"Create Project"**

### **1.3 Get Connection Details**
After project creation, you'll see:
- **Database URL**: `postgresql://username:password@host/database`
- **Host**: `ep-xxx-xxx.us-east-1.aws.neon.tech`
- **Database**: `neondb`
- **Username**: Your username
- **Password**: Auto-generated password

**📋 Copy the full DATABASE_URL - you'll need it next!**

---

## **Step 2: Configure Environment (Minimal Setup)**

### **2.1 Create Local Environment File**
```bash
# In your project root
cp .env.neon.example .env.local
```

### **2.2 Update .env.local (Only 3 Required Variables!)**
```bash
# Database Configuration (Neon PostgreSQL) - REQUIRED
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# Application Configuration - REQUIRED
NEXT_PUBLIC_APP_URL=http://localhost:3005

# Encryption Key (generate a random 32-character string) - REQUIRED
ENCRYPTION_KEY=your_32_character_encryption_key_here

# Demo Mode - OPTIONAL (enables testing without authentication)
DEMO_MODE=true
```

### **2.3 Generate Encryption Key**
```bash
# Generate Encryption Key (32 characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Or use OpenSSL
openssl rand -hex 16
```

**That's it! No Google OAuth setup required.**

---

## **Step 3: Initialize Database Schema**

### **3.1 Install Dependencies**
```bash
# Make sure all dependencies are installed
npm install
```

### **3.2 Generate Database Schema**
```bash
# Generate Drizzle migrations
npm run db:generate
```

### **3.3 Apply Schema to Neon Database**
```bash
# Push schema to Neon
npm run db:migrate
```

### **3.4 Seed Initial Data (Optional)**
```bash
# Add sample data for testing
npm run db:seed
```

---

## **Step 4: Test Your Setup**

### **4.1 Start Development Server**
```bash
npm run dev
```

### **4.2 Test Demo Mode**
1. Open [http://localhost:3005/demo](http://localhost:3005/demo)
2. Verify the dashboard loads with sample data
3. Test creating a new brand (should save to Neon database)
4. Check ADI dashboard: [http://localhost:3005/demo/adi](http://localhost:3005/demo/adi)

### **4.3 Verify Database Connection**
1. Go to [Neon Console](https://console.neon.tech/)
2. Select your project
3. Go to **SQL Editor**
4. Run: `SELECT * FROM brands;`
5. You should see any brands you created

---

## **Step 5: Neon Dashboard Overview**

### **5.1 Access Neon Console**
1. Go to [https://console.neon.tech/](https://console.neon.tech/)
2. Select your `ai-visibility-score` project

### **5.2 Key Features**
- **SQL Editor**: Run queries directly
- **Tables**: View your schema and data
- **Metrics**: Monitor database performance
- **Branches**: Create database branches for testing
- **Backups**: Automatic point-in-time recovery

### **5.3 Monitor Your Database**
```sql
-- Check tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- View sample data
SELECT * FROM brands LIMIT 5;
SELECT * FROM evaluations LIMIT 5;
```

---

## **Step 6: Production Deployment (Optional)**

### **6.1 Netlify Environment Variables**
When deploying to Netlify, add these environment variables:
```bash
DATABASE_URL=your_neon_production_url
NEXT_PUBLIC_APP_URL=https://your-domain.netlify.app
ENCRYPTION_KEY=your_encryption_key
DEMO_MODE=false
```

### **6.2 Optional: Add Authentication Later**
If you want to add user authentication later, you can:
1. Set up Google OAuth credentials
2. Add NextAuth environment variables
3. Set `DEMO_MODE=false`
4. Users will then need to sign in

---

## **🔧 Troubleshooting**

### **Common Issues & Solutions**

#### **Connection Error: "database does not exist"**
```bash
# Check your DATABASE_URL format
# Should be: postgresql://user:pass@host/db?sslmode=require
```

#### **SSL Connection Issues**
```bash
# Ensure your DATABASE_URL includes: ?sslmode=require
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

#### **Migration Errors**
```bash
# Reset and regenerate migrations
rm -rf drizzle/
npm run db:generate
npm run db:migrate
```

#### **Demo Mode Not Working**
```bash
# Ensure DEMO_MODE is set to true in .env.local
DEMO_MODE=true
```

---

## **📊 Database Schema Overview**

Your Neon database will include these tables:
- **`users`** - User accounts (optional, for authentication)
- **`brands`** - Brand information
- **`evaluations`** - AI visibility evaluations
- **`dimension_scores`** - Detailed scoring data
- **`ai_providers`** - AI provider configurations
- **`recommendations`** - Improvement suggestions

---

## **✅ Verification Checklist**

- [ ] Neon project created
- [ ] Database URL copied to `.env.local`
- [ ] Encryption key generated
- [ ] Environment variables set
- [ ] Database schema applied
- [ ] Demo mode working at `/demo`
- [ ] Data persisting to Neon
- [ ] ADI dashboard accessible

---

## **🎯 What You Get**

### **✅ Immediate Benefits**
- **No OAuth Setup Required**: Start testing immediately
- **Real Database**: Data persists in Neon PostgreSQL
- **Full UI Access**: All features available in demo mode
- **Production Ready**: Easy to add authentication later

### **🚀 Ready for Production**
- **Scalable Database**: Neon auto-scales with your needs
- **Backup & Recovery**: Built-in point-in-time recovery
- **Monitoring**: Performance metrics and alerts
- **Branching**: Database branches for testing

Your AI Visibility Score platform is now powered by **Neon's serverless PostgreSQL** with the simplest possible setup! 🚀

---

## **🔄 Optional: Adding Authentication Later**

If you decide to add user authentication later:

1. **Set up Google OAuth** (optional):
   ```bash
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

2. **Configure NextAuth**:
   ```bash
   NEXTAUTH_SECRET=your_secret
   NEXTAUTH_URL=http://localhost:3005
   ```

3. **Disable Demo Mode**:
   ```bash
   DEMO_MODE=false
   ```

The platform will automatically switch to requiring authentication when these variables are configured.
# Environment Management Guide

## 🎯 **Problem Solved: Multiple Supabase Projects**

You have two Supabase projects and need to manage them separately:

1. **Project 1**: `agentic_onboarding` (ejsanutzehcvgqyzumfh.supabase.co)
2. **Project 2**: `ai-visibility-score` (yuefjhbhkbbyrcazgfjl.supabase.co) ← **This project**

## ✅ **Solution Implemented**

### **1. Separate Environment Files Created**
```bash
.env.agentic_onboarding     # For project 1
.env.ai_visibility_score    # For project 2 (this project)
.env.local                  # Default fallback
```

### **2. Updated Package.json Scripts**
```json
{
  "scripts": {
    "dev": "next dev",                                    // Uses .env.local
    "dev:agentic": "dotenv -e .env.agentic_onboarding -- next dev",
    "dev:visibility": "dotenv -e .env.ai_visibility_score -- next dev"
  }
}
```

### **3. Current Configuration**
**AI Visibility Score Project** (`.env.ai_visibility_score`):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://yuefjhbhkbbyrcazgfjl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1ZWZqaGJoa2JieXJjYXpnZmpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODgwMjQsImV4cCI6MjA3MzI2NDAyNH0.JOdfPl-FmsbJJruoxYJkujL5FntjKW7-gzFBn9WBtbg
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1ZWZqaGJoa2JieXJjYXpnZmpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY4ODAyNCwiZXhwIjoyMDczMjY0MDI0fQ.BLE9SxrhYckE423yHd6gmXk0d7LPFk3l5OuxZ2w-WPk
```

## 🚀 **How to Use**

### **For AI Visibility Score Project** (Current)
```bash
npm run dev:visibility
```

### **For Agentic Onboarding Project**
```bash
npm run dev:agentic
```

### **Default (uses .env.local)**
```bash
npm run dev
```

## 🔧 **Environment File Priority**

When using `dotenv-cli`, the priority is:
1. **Specified file** (e.g., `.env.ai_visibility_score`)
2. **System environment variables**
3. **Default .env files**

## ✅ **Current Status**

- ✅ **dotenv-cli installed** for environment management
- ✅ **Separate environment files** for each project
- ✅ **Updated scripts** in package.json
- ✅ **Correct credentials** for AI Visibility Score project
- ✅ **Development server** running with proper environment

## 📋 **Next Steps**

1. **Database Setup**: Run the migration to create tables
2. **Test Authentication**: Verify signup/signin works
3. **Full Feature Testing**: Test all application features

## 🎯 **Commands Summary**

```bash
# Install dependencies
npm install

# Run AI Visibility Score project
npm run dev:visibility

# Run Agentic Onboarding project  
npm run dev:agentic

# Default development
npm run dev
```

This setup ensures clean separation between your projects and eliminates the multiple Supabase URL confusion!
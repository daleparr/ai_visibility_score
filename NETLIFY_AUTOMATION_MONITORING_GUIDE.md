# 📍 Where to Find Automation in Netlify

## 🎯 Quick Navigation Guide

### **Main Automation Dashboard**
1. Go to: https://app.netlify.com/sites/ai-discoverability-index
2. Click **"Functions"** in the left sidebar
3. Look for: **`scheduled-leaderboard-queue`**

This is your automated evaluation function that runs daily at 2 AM UTC.

---

## 🔍 Step-by-Step: Finding Your Automation

### **Step 1: Navigate to Functions**
```
Netlify Dashboard
  ↓
Sites → ai-discoverability-index
  ↓
Left Sidebar → "Functions"
  ↓
Find: "scheduled-leaderboard-queue"
```

**URL**: https://app.netlify.com/sites/ai-discoverability-index/functions

### **Step 2: View Function Details**
Click on **`scheduled-leaderboard-queue`**

You'll see:
- ✅ **Schedule**: `0 2 * * *` (2 AM UTC daily)
- ✅ **Status**: Active/Enabled
- ✅ **Last run**: Timestamp of last execution
- ✅ **Duration**: How long it took
- ✅ **Logs**: Detailed execution logs

### **Step 3: View Execution Logs**
In the function details page:
- Click **"Logs"** tab
- See real-time execution logs
- Filter by time period
- Search for specific brands

---

## 📊 What You'll See in Netlify

### **Functions Tab**

```
┌─────────────────────────────────────────────────────────┐
│  Functions                                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📋 scheduled-leaderboard-queue                         │
│     Status: ✅ Active                                   │
│     Schedule: 0 2 * * * (Daily at 2 AM UTC)            │
│     Last run: 2025-01-15 02:00:00 UTC                  │
│     Duration: 8m 32s                                    │
│     Result: ✅ Success                                  │
│                                                         │
│     [View Logs] [Edit Schedule] [Disable]               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### **Function Logs (Click "View Logs")**

```
┌─────────────────────────────────────────────────────────┐
│  Function Logs: scheduled-leaderboard-queue             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  2025-01-15 02:00:00 UTC                               │
│  ═══════════════════════════════════════════            │
│  🕐 NETLIFY SCHEDULED EVALUATION JOB STARTED           │
│  ⏰ Time: 2025-01-15T02:00:00.000Z                     │
│  ═══════════════════════════════════════════            │
│                                                         │
│  📊 Processing genuine brand evaluations...             │
│  📋 Found 5 brands to evaluate                         │
│                                                         │
│  ════════════════════════════════════════               │
│  Evaluating 1/5: Supreme                               │
│  ════════════════════════════════════════               │
│                                                         │
│  🚀 Starting genuine evaluation for Supreme            │
│  ✅ Using existing brand record: [uuid]                │
│  ✅ Created evaluation record: [uuid]                  │
│  ✅ ADI Orchestrator initialized                       │
│  🤖 Executing full multi-agent ADI evaluation...       │
│  ✅ Orchestration completed: completed                 │
│  ✅ ADI Score calculated: 87/100 (A)                   │
│  ✅ Evaluation record updated with final scores        │
│  ✅ Genuine evaluation completed for Supreme           │
│                                                         │
│  ... (4 more brands) ...                               │
│                                                         │
│  ═══════════════════════════════════════════            │
│  ✅ BATCH PROCESSING COMPLETE                          │
│  📈 Processed: 5                                       │
│  ✅ Successful: 5                                      │
│  ❌ Failed: 0                                          │
│  ═══════════════════════════════════════════            │
│                                                         │
│  ═══════════════════════════════════════════            │
│  ✅ SCHEDULED JOB COMPLETE                             │
│  ⏱️  Duration: 8 minutes                               │
│  📊 Success rate: 100%                                 │
│  ═══════════════════════════════════════════            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎛️ Netlify Function Controls

### **View Schedule**
Location: Functions → scheduled-leaderboard-queue → Settings

You'll see:
```
Schedule: 0 2 * * *
Cron expression: Daily at 2 AM UTC
Next run: 2025-01-16 02:00:00 UTC
```

### **Edit Schedule** (If Needed)
Location: Site settings → Functions → Scheduled functions

Or edit `netlify.toml`:
```toml
[functions."scheduled-leaderboard-queue"]
schedule = "0 2 * * *"  # Daily at 2 AM UTC

# Other options:
# "0 */6 * * *"   # Every 6 hours
# "0 0 * * 0"     # Weekly on Sunday
# "0 */4 * * *"   # Every 4 hours
```

### **Enable/Disable**
In function details page:
- Toggle: **"Enable scheduled function"**
- Disable to stop automation
- Enable to restart

### **Manually Trigger**
Two options:

**Option 1: Via Netlify UI**
- Go to function details
- Click **"Trigger function"** button
- Watch logs in real-time

**Option 2: Via API**
```bash
curl -X POST https://ai-discoverability-index.netlify.app/api/leaderboard-scheduler \
  -H "Content-Type: application/json" \
  -d '{"action": "trigger"}'
```

---

## 📊 Monitoring Execution

### **Real-Time Logs**

**Where**: Functions → scheduled-leaderboard-queue → Logs tab

**What you'll see**:
- 🕐 Start timestamp
- 📋 Number of brands being processed
- 🚀 Each brand evaluation starting
- ✅ Success/failure for each brand
- 💾 Database saves confirmed
- 📊 Final statistics
- ⏱️ Total duration

### **Filter Logs**
Use the search/filter:
- Search: `"Evaluating"` - See which brands processed
- Search: `"✅ Successful"` - See success count
- Search: `"❌ Failed"` - See any failures
- Search: `"ADI Score"` - See calculated scores

### **Download Logs**
- Click **"Download logs"** button
- Exports full execution log
- Useful for analysis/debugging

---

## 📈 Function Analytics

### **Execution History**

**Where**: Functions → scheduled-leaderboard-queue → Analytics

You'll see:
- **Invocation count**: How many times function ran
- **Success rate**: % of successful executions
- **Duration trends**: Average execution time
- **Error rate**: % of failed runs

### **Charts Available**
- Invocations over time
- Success/failure distribution
- Duration trends
- Memory usage
- Billable duration

---

## 🔔 Setting Up Alerts

### **Email Notifications**

**Where**: Site settings → Notifications

Configure:
- ✅ Function deployment failed
- ✅ Function execution failed
- ✅ Scheduled function failed

### **Webhook Alerts**

Set environment variable in Netlify:
```
ALERT_WEBHOOK_URL = https://hooks.slack.com/services/YOUR/WEBHOOK
```

**Where to set**:
1. Site settings → Environment variables
2. Add: `ALERT_WEBHOOK_URL`
3. Value: Your Slack/Discord webhook URL

The automation will send alerts for:
- ✅ Daily evaluation success
- ❌ Evaluation failures
- 🚨 3+ consecutive failures

---

## 🎛️ Netlify Environment Variables

### **Where**: Site settings → Environment variables

**Required for Automation**:
```
NETLIFY_DATABASE_URL         = postgresql://...  ✅ (should exist)
OPENAI_API_KEY               = sk-...           ✅ (should exist)
ANTHROPIC_API_KEY            = sk-ant-...       ✅ (alternative)
GOOGLE_AI_API_KEY            = ...              ✅ (alternative)
```

**Optional**:
```
DAILY_EVALUATION_HOUR        = 2                (default: 2 AM)
BATCH_SIZE                   = 5                (default: 5)
DAILY_LIMIT                  = 20               (default: 20)
ALERT_WEBHOOK_URL            = https://...      (Slack/Discord)
```

---

## 🔍 How to Debug

### **If Function Doesn't Run**

**Check 1**: Function Status
- Go to Functions tab
- Verify `scheduled-leaderboard-queue` shows as "Active"

**Check 2**: Schedule Configuration
- Click function name
- Verify schedule: `0 2 * * *`
- Check "Next run" timestamp

**Check 3**: Logs
- Click "Logs" tab
- Look for execution attempts
- Check for errors

### **If Function Runs But Fails**

**Check 1**: Function Logs
```
Look for:
❌ "Error:" messages
❌ "Failed to..." messages
❌ Stack traces
```

**Check 2**: Environment Variables
- Verify `NETLIFY_DATABASE_URL` is set
- Verify at least one AI API key is set (OpenAI/Anthropic/Google)

**Check 3**: Manual Trigger
```bash
# Test manually to see detailed errors
curl -X POST https://ai-discoverability-index.netlify.app/api/leaderboard-scheduler \
  -d '{"action": "trigger"}'
```

---

## 📱 Quick Access Links

### **Netlify Dashboard Locations**

| What | Where to Find |
|------|---------------|
| **Scheduled Function** | Functions → `scheduled-leaderboard-queue` |
| **Execution Logs** | Functions → scheduled-leaderboard-queue → Logs |
| **Schedule Settings** | Functions → scheduled-leaderboard-queue → Settings |
| **Analytics** | Functions → scheduled-leaderboard-queue → Analytics |
| **Environment Vars** | Site settings → Environment variables |
| **Build Logs** | Deploys → Latest deploy → Deploy log |
| **Function List** | Left sidebar → Functions |

### **Direct URLs**

**Functions Dashboard**:
https://app.netlify.com/sites/ai-discoverability-index/functions

**Latest Deploy**:
https://app.netlify.com/sites/ai-discoverability-index/deploys

**Site Settings**:
https://app.netlify.com/sites/ai-discoverability-index/settings

**Environment Variables**:
https://app.netlify.com/sites/ai-discoverability-index/settings/env

---

## 🎯 What to Monitor

### **Daily Checklist** (9 AM each day)

**1. Check Last Run**
- Go to: Functions → scheduled-leaderboard-queue
- Look at: "Last run" timestamp (should be ~2 AM UTC)
- Status: Should show ✅ Success

**2. View Execution Logs**
- Click: "Logs" tab
- Check: Last execution completed successfully
- Verify: 5 brands were processed
- Confirm: "✅ BATCH PROCESSING COMPLETE"

**3. Check Statistics**
```bash
curl "https://ai-discoverability-index.netlify.app/api/leaderboard-population?action=stats"
```

Expected to see:
```json
{
  "queueStats": {
    "pending": 495,  // Decreasing daily
    "completed": 5,  // Increasing daily
    "totalToday": 5
  }
}
```

### **Weekly Review**
- Total brands evaluated
- Success rate (target >95%)
- Average duration per batch
- Any recurring errors

---

## 🚨 Alert Indicators

### **In Netlify Dashboard**

**Green (Good)**:
- ✅ Last run: Success
- ✅ Status: Active
- ✅ Duration: 5-10 minutes

**Yellow (Warning)**:
- ⚠️ Duration: >15 minutes
- ⚠️ Some failures in batch
- ⚠️ Success rate: 80-95%

**Red (Critical)**:
- ❌ Last run: Failed
- ❌ Multiple consecutive failures
- ❌ Function disabled
- ❌ Success rate: <80%

---

## 🎛️ Netlify Configuration File

Your automation is configured in **`netlify.toml`**:

```toml
[functions."scheduled-leaderboard-queue"]
schedule = "0 2 * * *"  # Daily at 2 AM UTC
```

**Cron Format**: `minute hour day month day-of-week`
- `0 2 * * *` = Every day at 2:00 AM UTC

**Alternative Schedules**:
```toml
# Every 6 hours
schedule = "0 */6 * * *"

# Every 4 hours  
schedule = "0 */4 * * *"

# Twice daily (2 AM and 2 PM)
schedule = "0 2,14 * * *"

# Weekly on Monday at 2 AM
schedule = "0 2 * * 1"
```

---

## 📍 Exact Netlify Navigation Paths

### **View Scheduled Function**
```
1. Login to Netlify: https://app.netlify.com
2. Select site: "ai-discoverability-index"
3. Left sidebar → "Functions"
4. Find in list → "scheduled-leaderboard-queue"
5. Click to open function details
```

### **View Execution Logs**
```
Functions → scheduled-leaderboard-queue → Logs tab

Filter options:
- Time range: Last 24 hours / 7 days / 30 days
- Search: Enter text to find specific logs
- Level: All / Info / Error / Warning
```

### **View Schedule Settings**
```
Functions → scheduled-leaderboard-queue → Settings tab

Shows:
- Cron schedule: 0 2 * * *
- Next execution: [timestamp]
- Enable/disable toggle
- Delete function button (don't use!)
```

### **View Analytics**
```
Functions → scheduled-leaderboard-queue → Analytics tab

Metrics:
- Invocations (total runs)
- Success rate (%)
- Duration (average time)
- Errors (count)
- Charts over time
```

---

## 🔔 Setting Up Email Alerts

### **Enable Function Failure Notifications**

**Path**: Site settings → Notifications

**Steps**:
1. Click **"Add notification"**
2. Select: **"Function failed to deploy"**
3. Add your email
4. Save

**Repeat for**:
- "Scheduled function failed"
- "Function execution error"

You'll get email alerts when automation fails.

---

## 📊 Alternative Monitoring (API Endpoints)

If you prefer programmatic monitoring:

### **Check Scheduler Status**
```bash
curl "https://ai-discoverability-index.netlify.app/api/leaderboard-scheduler?action=status"
```

Response shows:
```json
{
  "status": "running",
  "isRunning": false,
  "lastRunStatus": "success",
  "lastRunTime": "2025-01-15T02:00:00.000Z",
  "consecutiveFailures": 0,
  "nextRunTime": "2025-01-16T02:00:00.000Z"
}
```

### **Check Queue Progress**
```bash
curl "https://ai-discoverability-index.netlify.app/api/leaderboard-population?action=stats"
```

Response shows:
```json
{
  "queueStats": {
    "pending": 495,
    "completed": 5,
    "failed": 0,
    "totalToday": 5
  },
  "cacheStats": {
    "totalEntries": 5,
    "expiredEntries": 0
  }
}
```

---

## 🎯 What to Look For

### **Successful Execution Indicators**

In Netlify logs, you should see:
```
✅ "BATCH PROCESSING COMPLETE"
✅ "Processed: 5"
✅ "Successful: 5"
✅ "Success rate: 100%"
✅ "SCHEDULED JOB COMPLETE"
```

### **Database Persistence Confirmation**

Look for these log lines:
```
✅ "Created evaluation record: [uuid]"
✅ "ADI Orchestrator initialized"
✅ "Orchestration completed: completed"
✅ "ADI Score calculated: [score]/100"
✅ "Evaluation record updated with final scores"
```

This confirms data is being saved to Neon DB.

### **Ranking Updates**

Look for:
```
✅ "Successfully evaluated [brand name]"
✅ "Updated niche rankings for [niche]"
```

---

## 🚀 QUICK REFERENCE

### **Main Dashboard**
📍 https://app.netlify.com/sites/ai-discoverability-index/functions

### **Your Scheduled Function**
📍 Look for: `scheduled-leaderboard-queue`

### **Schedule**
⏰ `0 2 * * *` = Daily at 2:00 AM UTC

### **What It Does**
🤖 Evaluates 5 brands with genuine ADI methodology  
💾 Saves all probe runs and agent data to Neon DB  
🏆 Populates leaderboard cache with real rankings  
📊 Processes ~500 brands in 25 days  

### **Monitor Via API**
```bash
# Status
curl "https://.../api/leaderboard-scheduler?action=status"

# Stats
curl "https://.../api/leaderboard-population?action=stats"
```

---

## 🎉 YOU'RE ALL SET!

**Where to find it**: Netlify → Functions → `scheduled-leaderboard-queue`

**When it runs**: Every day at 2 AM UTC (automatically)

**What it does**: Evaluates 5 brands with genuine ADI methodology

**Where data goes**: Neon database (probe_runs, page_blobs, evaluations, leaderboard_cache)

**How to monitor**: 
1. Netlify function logs
2. API status endpoints
3. Email notifications (if configured)

🚀 **Your automation is running!**


# ⚡ Quick Start: Automated Leaderboard System

## 🎯 What You Get

Genuine ADI evaluations for 500+ brands across 26 niches, automatically executed daily with full database persistence.

---

## 🚀 3-Step Setup

### Step 1: Seed the Queue (2 minutes)
```bash
npm run leaderboard:seed
```
Creates 500+ brand selections across 26 niches.

### Step 2: Test the System (2 minutes)
```bash
npm run test:evaluations
```
Runs one genuine evaluation and verifies database persistence.

### Step 3: Deploy & Monitor (Automatic)
The Netlify scheduled function automatically runs daily at 2 AM UTC.

Check status:
```bash
curl "https://ai-discoverability-index.netlify.app/api/leaderboard-scheduler?action=status"
```

---

## ✅ What Happens Automatically

Every day at 2 AM UTC:
1. System fetches 5 pending brands from queue
2. Runs genuine ADI evaluation for each:
   - Executes all 11 agents (crawl, schema, LLM test, etc.)
   - Runs 13+ LLM probes with OpenAI/Anthropic/Google
   - Saves all probe results to `probe_runs` table
   - Saves HTML content to `page_blobs` table
   - Calculates ADI score (0-100)
3. Caches results in `leaderboard_cache`
4. Updates rankings (niche, industry, sector, global)
5. Logs detailed progress and statistics

**Result**: 20 brands evaluated per day = 500 brands in ~25 days

---

## 📊 Monitor Progress

### Quick Status Check
```bash
curl "https://ai-discoverability-index.netlify.app/api/leaderboard-population?action=stats"
```

### Expected Response
```json
{
  "queueStats": {
    "pending": 480,
    "completed": 20,
    "totalToday": 5
  },
  "cacheStats": {
    "totalEntries": 20,
    "expiredEntries": 0
  }
}
```

---

## 🔍 Verify Database Writes

The system saves to Neon database:
- ✅ `probe_runs` - All LLM probe results
- ✅ `page_blobs` - HTML content from websites
- ✅ `evaluations` - Final ADI scores
- ✅ `leaderboard_cache` - Cached results for fast retrieval
- ✅ `brands` - Brand records

Test it:
```bash
npm run test:evaluations
```

---

## 💰 Costs

- **Per evaluation**: $0.13 - $0.26 (LLM API costs)
- **Daily (20 brands)**: $2.60 - $5.20
- **Monthly**: ~$78 - $156

---

## 🎯 Timeline

| Day | Brands | Progress |
|-----|--------|----------|
| 1   | 20     | 4%       |
| 7   | 140    | 28%      |
| 14  | 280    | 56%      |
| 25  | 500    | 100% ✅  |

---

## 🛠️ Manual Control

### Trigger Immediate Evaluation
```bash
curl -X POST https://ai-discoverability-index.netlify.app/api/leaderboard-scheduler \
  -H "Content-Type: application/json" \
  -d '{"action": "trigger"}'
```

### Stop Scheduler
```bash
curl -X POST https://ai-discoverability-index.netlify.app/api/leaderboard-scheduler \
  -H "Content-Type: application/json" \
  -d '{"action": "stop"}'
```

### Process Batch Manually
```bash
npm run leaderboard:process
```

---

## 🎉 That's It!

The system is fully automated. No ongoing maintenance required.

**Complete Documentation**: See `AUTOMATED_LEADERBOARD_SYSTEM_COMPLETE.md`

**Test Suite**: `npm run test:evaluations`

**Support**: Check `FULL_AUTOMATION_IMPLEMENTATION_SUMMARY.md` for troubleshooting


# Railway Callback Persistence Diagnosis

## Evidence from Neon Console Screenshot

### ✅ Table Status: EXISTS
- **Table**: `production.backend_agent_executions`
- **Total Rows**: 199 (visible in screenshot)
- **Schema**: production (correct)
- **Structure**: Matches schema.ts definition

### ✅ Successful Records Found
**Evaluation**: `c13f9bb0-7775-4d60-812d-aad069ac932c`

Completed agents visible in screenshot:
1. commerce_agent - completed
2. llm_test_agent - completed
3. geo_visibility_agent - completed
4. citation_agent - completed
5. sentiment_agent - completed

**This proves the system CAN persist Railway results!**

## 🔍 Why New Evaluations Show 0 Rows

### Timeline Analysis

**From Frontend Logs (08:18:45 PM - 08:19:41 PM)**:

1. **08:18:55 PM**: Evaluation `875d69b8-fca4-4382-9ad1-37ccbbac5eeb` created
2. **08:18:55 PM**: Fast agents completed successfully
3. **08:18:55 PM**: 6 slow agents enqueued to Railway (Job ID: 22)
4. **08:18:57 PM**: Netlify tracker creates crawl_agent record
5. **08:19:03 PM**: Netlify tracker creates citation_agent record
6. **08:19:07 PM**: Netlify tracker creates commerce_agent record
7. **08:19:13 PM**: Netlify tracker creates sentiment_agent record
8. **08:19:17 PM**: Netlify tracker creates llm_test_agent record  
9. **08:19:20 PM**: Netlify tracker creates geo_visibility_agent record

**08:19:20 PM**: Railway enqueue completes successfully

### The Missing Link

**Netlify is creating "tracking" records** (status: pending)
**Railway should be UPDATING these to completed** (via callback)

But queries show 0 rows, which means either:
1. The INSERT from Netlify tracker is failing silently
2. The records are in a different schema
3. There's a transaction isolation issue

## 🎯 Root Cause: Netlify Tracker Not Persisting

Looking at the logs more carefully:

```
📋 [Tracker] Started tracking crawl_agent execution: 875d69b8-fca4-4382-9ad1-37ccbbac5eeb-crawl_agent-1759951135280
```

This message suggests tracker is trying to track, but then:

```
🔍 [Tracker] Query: SELECT * FROM backend_agent_executions WHERE evaluation_id = '875d69b8-fca4-4382-9ad1-37ccbbac5eeb'
🔍 [Tracker] Raw SQL query returned 0 rows
```

**The issue**: The tracker's INSERT is not persisting before the SELECT query runs!

### Possible Causes

1. **Transaction not committed** - INSERT happens in a transaction that's not committed
2. **Schema mismatch** - Writing to `public.backend_agent_executions` instead of `production.backend_agent_executions`
3. **Async timing** - INSERT completes after SELECT runs
4. **Connection pooling** - Different connections seeing different data

## 🔧 Verification Steps

### Check 1: Verify Schema in Tracker
The BackendAgentTracker might be writing to the wrong schema (public vs production)

### Check 2: Check Transaction Handling
The tracker might not be committing transactions properly

### Check 3: Check Recent Rows
Query for the specific evaluation ID directly in Neon console:
```sql
SELECT * FROM production.backend_agent_executions 
WHERE evaluation_id = '875d69b8-fca4-4382-9ad1-37ccbbac5eeb'
ORDER BY created_at DESC;
```

If this returns 0 rows, the INSERTs never happened.
If this returns rows, there's a read consistency issue.

## 💡 Recommendation

The most likely issue is that **BackendAgentTracker.trackAgentStart()** is creating records but NOT in the production schema or NOT committing the transaction.

Need to check:
- `src/lib/adi/backend-agent-tracker.ts` - schema specification
- Transaction commit after INSERT
- Whether `withSchema()` wrapper is being used correctly


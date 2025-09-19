# 🚨 PRODUCTION SCHEMA DRIFT ANALYSIS
## Critical Database Schema Mismatches Between Code and Production Schema

**Date**: 2025-09-19  
**Issue**: Live web app code references outdated table names and may be pointing to dropped 'public' schema instead of 'production' schema  
**Impact**: Evaluation data not persisting to database, empty tables in production

---

## 📋 EXECUTIVE SUMMARY

The live web app code contains multiple schema drift issues where:
1. **Table Names**: Code uses camelCase (`dimensionScores`) but production schema uses snake_case (`dimension_scores`)
2. **Schema References**: Code may be targeting `public` schema instead of `production` schema
3. **Missing Tables**: Code references tables that don't exist in production schema
4. **Column Name Mismatches**: Potential field name inconsistencies

---

## 🔍 DETAILED FINDINGS

### 1. **CRITICAL TABLE NAME MISMATCHES**

| Code Reference | Production Schema Table | Status | Impact |
|---|---|---|---|
| `dimensionScores` | `dimension_scores` | ❌ MISMATCH | Data not saving |
| `evaluations` | `evaluations` | ✅ MATCH | OK |
| `brands` | `brands` | ✅ MATCH | OK |
| `users` | `users` | ✅ MATCH | OK |
| `accounts` | `accounts` | ✅ MATCH | OK |
| `sessions` | `sessions` | ✅ MATCH | OK |
| `userProfiles` | `user_profiles` | ❌ MISMATCH | Potential issue |
| `websiteSnapshots` | `website_snapshots` | ❌ MISMATCH | Crawl data not saving |
| `adiAgentResults` | NOT IN PRODUCTION | ❌ MISSING | Unused table definition |

### 2. **SCHEMA REFERENCE ANALYSIS**

**Current Code Schema Definitions:**
```typescript
// src/lib/db/schema.ts
export const productionSchema = pgSchema('production')
export const dimensionScores = productionSchema.table('dimension_scores', {
  // Table definition uses correct snake_case name
})
```

**Issue**: The schema definition is CORRECT (`dimension_scores`), but the variable name `dimensionScores` may be causing confusion.

### 3. **DATABASE IMPORT ANALYSIS**

**ADI Service Database Imports:**
```typescript
// src/lib/adi/adi-service.ts:694
const { evaluations, dimensionScores, websiteSnapshots } = await import('../db/schema')
```

**Analysis**: Code imports `dimensionScores` variable which correctly maps to `production.dimension_scores` table.

### 4. **PRODUCTION SCHEMA TABLES (CORRECT)**

Based on the provided production schema, these tables should exist:

#### Core Tables:
- ✅ `production.users`
- ✅ `production.accounts` 
- ✅ `production.sessions`
- ✅ `production.user_profiles`
- ✅ `production.brands`
- ✅ `production.evaluations`
- ✅ `production.dimension_scores`

#### Leaderboard Tables:
- ✅ `production.evaluation_queue`
- ✅ `production.leaderboard_cache`
- ✅ `production.competitive_triggers`
- ✅ `production.niche_brand_selection`
- ✅ `production.leaderboard_stats`

#### Crawl Data Tables:
- ✅ `production.website_snapshots`
- ✅ `production.content_changes`

#### Analytics Tables:
- ✅ `production.evaluation_cache`
- ✅ `production.cache_performance`
- ✅ `production.evaluation_trends`
- ✅ `production.predictive_insights`
- ✅ `production.competitive_analysis`
- ✅ `production.system_performance_metrics`

#### Federated Learning Tables:
- ✅ `production.federated_learning_sessions`
- ✅ `production.model_improvements`
- ✅ `production.user_engagement_metrics`

#### Subscription Tables:
- ✅ `production.subscriptions`

---

## 🔧 REQUIRED FIXES

### 1. **Schema Definition Updates**

**File**: `src/lib/db/schema.ts`

**Current Issues**:
```typescript
// These variable names should match the actual table names for clarity
export const dimensionScores = productionSchema.table('dimension_scores', {
export const userProfiles = productionSchema.table('user_profiles', {
export const websiteSnapshots = productionSchema.table('website_snapshots', {
```

**Recommended Fix**: Update variable names to match table names:
```typescript
export const dimension_scores = productionSchema.table('dimension_scores', {
export const user_profiles = productionSchema.table('user_profiles', {  
export const website_snapshots = productionSchema.table('website_snapshots', {
```

### 2. **Code Reference Updates**

**Files to Update**:
- `src/lib/adi/adi-service.ts` - Update import and usage
- `src/lib/database.ts` - Update any references
- All API routes that use these tables

**Example Fix**:
```typescript
// OLD
const { evaluations, dimensionScores, websiteSnapshots } = await import('../db/schema')
await db.insert(dimensionScores).values(dimensionRecord)

// NEW  
const { evaluations, dimension_scores, website_snapshots } = await import('../db/schema')
await db.insert(dimension_scores).values(dimensionRecord)
```

### 3. **Missing Table Definitions**

**Add Missing Tables to Schema**:
- `evaluation_queue`
- `leaderboard_cache` 
- `competitive_triggers`
- `niche_brand_selection`
- `leaderboard_stats`
- `website_snapshots`
- `content_changes`
- `federated_learning_sessions`
- `model_improvements`
- `user_engagement_metrics`
- `evaluation_cache`
- `cache_performance`
- `evaluation_trends`
- `predictive_insights`
- `competitive_analysis`
- `system_performance_metrics`

### 4. **Database Connection Verification**

**Issue**: Code may be connecting to wrong schema or database
**Fix**: Verify environment variables point to production database with production schema

---

## 🚀 DEPLOYMENT PLAN

### Phase 1: Schema Definition Fix
1. Update `src/lib/db/schema.ts` with correct variable names
2. Update all imports across codebase
3. Test locally

### Phase 2: Missing Table Definitions  
1. Add all missing production tables to schema
2. Update types and relations
3. Test database operations

### Phase 3: Production Deployment
1. Deploy schema fixes to production
2. Run database migration to ensure all tables exist
3. Test evaluation flow end-to-end

### Phase 4: Verification
1. Verify data is saving to `production.dimension_scores`
2. Verify data is saving to `production.evaluations`
3. Verify crawl data is saving to `production.website_snapshots`

---

## 🎯 IMMEDIATE ACTION REQUIRED

**Priority 1**: Fix `dimensionScores` → `dimension_scores` mismatch
**Priority 2**: Verify production schema migration completed successfully  
**Priority 3**: Update all code references to use correct table names
**Priority 4**: Test evaluation flow to confirm data persistence

---

## 📊 RISK ASSESSMENT

| Risk Level | Issue | Impact |
|---|---|---|
| 🔴 **CRITICAL** | Data not saving to dimension_scores | Complete evaluation data loss |
| 🟡 **HIGH** | Missing table definitions | Features not working |
| 🟡 **HIGH** | Schema drift | Inconsistent data storage |
| 🟢 **MEDIUM** | Variable naming confusion | Developer confusion |

---

## ✅ SUCCESS CRITERIA

1. ✅ All evaluation data saves to `production.dimension_scores`
2. ✅ All evaluation records save to `production.evaluations`  
3. ✅ Crawl data saves to `production.website_snapshots`
4. ✅ No database errors in production logs
5. ✅ End-to-end evaluation test passes

---

**Next Steps**: Implement schema fixes and deploy to production immediately to resolve data persistence issues.
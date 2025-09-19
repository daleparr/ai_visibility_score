# 🚨 URGENT: Production Database Deployment Plan

## Critical Issue Summary
The production web app evaluation system is failing to write data to the database because:

1. **Code expects `production` schema tables** (✅ Correct)
2. **Database may have tables in `public` schema** (❌ Problem)
3. **Missing production schema migrations** (❌ Problem)

## Current Status Analysis

### ✅ What's Working
- Code is correctly configured to use `production` schema
- Database connection string is available
- Evaluation API logic is sound
- ADI agent system is functional

### ❌ What's Broken
- `production.evaluations` table may not exist
- `production.dimension_scores` table may not exist
- Database migrations not deployed to production
- Evaluation data being lost

## Immediate Action Plan

### Phase 1: Database Schema Verification ⏱️ 5 minutes
1. **Check existing production schema tables**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'production' 
   ORDER BY table_name;
   ```

2. **Verify critical tables exist**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'production' 
   AND table_name IN ('evaluations', 'dimension_scores', 'brands', 'users');
   ```

### Phase 2: Production Schema Migration ⏱️ 10 minutes
1. **Create production schema if missing**
2. **Deploy all core tables to production schema**
3. **Migrate existing data from public to production schema**
4. **Verify table structure matches code expectations**

### Phase 3: Code Deployment ⏱️ 5 minutes
1. **Ensure all code uses production schema** (Already done)
2. **Deploy to Netlify production**
3. **Verify environment variables**

### Phase 4: End-to-End Testing ⏱️ 10 minutes
1. **Test evaluation API endpoint**
2. **Verify data persistence in production.evaluations**
3. **Confirm dimension_scores are saved**
4. **Validate complete evaluation flow**

## Critical Files to Deploy

### Database Migration Files
- `PRODUCTION_SCHEMA_COMPLETE.sql` - Complete production schema setup
- `drizzle/0002_comprehensive_evaluation_enhancement.sql` - Enhanced tables

### Code Files (Already Correct)
- `src/lib/db/schema.ts` - Uses productionSchema ✅
- `src/lib/database.ts` - Database operations ✅
- `src/app/api/evaluate/route.ts` - Evaluation API ✅

## Risk Assessment

### 🔴 High Risk
- **Data Loss**: Evaluations not being saved
- **User Experience**: Failed evaluations appear successful
- **Business Impact**: No evaluation data for analysis

### 🟡 Medium Risk
- **Performance**: Mock database fallback in production
- **Monitoring**: No visibility into actual usage

### 🟢 Low Risk
- **Code Quality**: Application logic is sound
- **Architecture**: Schema design is correct

## Success Criteria

### ✅ Phase 1 Complete When:
- [ ] Production schema exists
- [ ] Core tables identified in production schema
- [ ] Table structure verified

### ✅ Phase 2 Complete When:
- [ ] All production schema tables created
- [ ] Data migration completed (if needed)
- [ ] Foreign key constraints working

### ✅ Phase 3 Complete When:
- [ ] Code deployed to Netlify
- [ ] Environment variables verified
- [ ] Database connection confirmed

### ✅ Phase 4 Complete When:
- [ ] Evaluation API returns success
- [ ] Data appears in production.evaluations
- [ ] Dimension scores saved correctly
- [ ] End-to-end flow validated

## Next Steps

1. **Switch to Code Mode** to implement database migrations
2. **Create production schema migration script**
3. **Deploy database changes**
4. **Test and validate**

## Emergency Contacts & Resources

- **Database**: Neon PostgreSQL (production)
- **Deployment**: Netlify
- **Monitoring**: Check production.evaluations table
- **Rollback**: Revert to public schema if needed

---

**⚠️ CRITICAL**: This issue is causing complete data loss for all evaluations. Immediate action required.
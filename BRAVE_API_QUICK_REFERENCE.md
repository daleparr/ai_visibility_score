# Brave API Debug - Quick Reference Card

## 🚨 Emergency Triage (30 seconds)

```bash
# 1. Quick connection test
psql $DATABASE_URL -c "SELECT 'OK' as status, current_database(), current_user;"

# 2. Check if data exists
psql $DATABASE_URL -c "SELECT count(*) FROM production.brands;"

# 3. Run automated debug
node scripts/brave-api-debug.js
```

## 🔧 Debug Commands

### Database Health Check
```sql
SELECT 
  current_database() as db,
  current_user as user,
  (SELECT count(*) FROM production.brands) as brands,
  (SELECT count(*) FROM production.evaluations) as evaluations;
```

### Enable Debug Logging
```bash
export DB_DEBUG=true
export NODE_ENV=development
```

### Test API Endpoint
```bash
curl -X POST http://localhost:3000/api/test-brave-integration \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "debug-user-123",
    "brandName": "Debug Test Brand", 
    "websiteUrl": "https://example.com",
    "industry": "Technology"
  }'
```

## 📊 Key Metrics to Monitor

| Metric | Command | Expected |
|--------|---------|----------|
| Connection | `SELECT 1` | Returns 1 |
| Schema Access | `SELECT count(*) FROM production.brands` | Returns number |
| Recent Inserts | `SELECT count(*) FROM production.brands WHERE created_at > now() - interval '1 hour'` | > 0 if active |
| User Permissions | `SELECT has_table_privilege('production.brands', 'INSERT')` | true |

## 🐛 Common Issues & Fixes

### "relation does not exist"
```sql
-- Check schema
SHOW search_path;
SET search_path TO production, public;
```

### "permission denied"
```sql
-- Check permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'brands';
```

### "constraint violation"
```sql
-- Check constraints
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'brands';
```

## 🔍 Debug Files

- **Runbook**: `BRAVE_API_DEBUG_RUNBOOK.md`
- **Debug Script**: `scripts/brave-api-debug.js`
- **Test API**: `/api/test-brave-integration`
- **Database Config**: `src/lib/database.ts`

## 📞 Quick Actions

```bash
# Run full debug suite
npm run debug:brave

# Test database connection
npm run db:test

# Enable debug mode
export DB_DEBUG=true && npm run dev

# Check logs
tail -f .next/server.log | grep -E "(DB|ERROR|BRAVE)"
```

## 🎯 Success Criteria

✅ Canary insert works  
✅ Row counts increase after operations  
✅ API endpoint returns 200  
✅ Correlation IDs appear in logs  
✅ No constraint violations  
✅ Data persists after insert  

---
*Generated: $(date)*  
*Correlation ID: Use UUIDs for tracking*
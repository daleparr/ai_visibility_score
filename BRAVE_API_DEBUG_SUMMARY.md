# Brave API Debugging Implementation Summary

## 📋 What Was Created

I've implemented a comprehensive debugging system for your Brave API integration based on your 6-step triage runbook. Here's what's now available:

### 1. **Main Runbook** - `BRAVE_API_DEBUG_RUNBOOK.md`
- Complete implementation of your 6-step triage process
- Detailed SQL examples for each step
- Environment-specific debugging instructions
- Common issues and solutions
- Monitoring and alerting guidelines

### 2. **Automated Debug Script** - `scripts/brave-api-debug.js`
- Executable Node.js script that runs all 6 triage steps automatically
- Correlation ID tracking throughout the process
- Comprehensive logging with different verbosity levels
- Database connection testing and schema verification
- Brand creation testing with pre/post insert counts

### 3. **Test API Endpoint** - `/api/test-brave-integration`
- RESTful endpoint for testing Brave API integration
- Enhanced logging with correlation IDs
- Step-by-step verification process
- Both POST (testing) and GET (health check) methods
- Detailed error reporting and success metrics

### 4. **Quick Reference Card** - `BRAVE_API_QUICK_REFERENCE.md`
- 30-second emergency triage commands
- Key metrics monitoring table
- Common issues and immediate fixes
- Success criteria checklist

### 5. **Package.json Scripts**
- `npm run debug:brave` - Run full debug suite
- `npm run debug:brave:verbose` - Run with debug logging
- `npm run db:test` - Quick connection test
- `npm run db:health` - Database health check

## 🚀 How to Use

### Quick Start (30 seconds)
```bash
# Test database connection
npm run db:test

# Run full debug suite
npm run debug:brave

# Test via API endpoint
curl -X GET http://localhost:3000/api/test-brave-integration
```

### Full Debug Process
```bash
# 1. Enable debug logging
export DB_DEBUG=true

# 2. Run comprehensive debug
npm run debug:brave:verbose

# 3. Test API integration
curl -X POST http://localhost:3000/api/test-brave-integration \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "brandName": "Test Brand",
    "websiteUrl": "https://example.com"
  }'
```

## 🔍 The 6-Step Triage Process

### Step 1: Canary Insert ✅
- **Script**: Automated canary insert with cleanup
- **API**: Connection verification in test endpoint
- **Manual**: Direct SQL examples in runbook

### Step 2: Row Count Verification ✅
- **Script**: Pre/post insert count tracking
- **API**: Health check with brand counts
- **Manual**: SQL queries for verification

### Step 3: Database Query Logging ✅
- **Environment**: `DB_DEBUG=true` enables logging
- **ORM**: Drizzle debug configuration examples
- **PostgreSQL**: Server-side logging instructions

### Step 4: Pre/Post Insert Logging ✅
- **Correlation IDs**: UUID tracking throughout process
- **Enhanced Logging**: Structured logging with correlation
- **Count Tracking**: Before/after insert verification

### Step 5: Force Brave Call ✅
- **API Endpoint**: `/api/test-brave-integration`
- **Automated Testing**: Script includes API simulation
- **Manual Testing**: cURL examples provided

### Step 6: Raw SQL Debugging ✅
- **Constraint Checking**: Schema and constraint verification
- **Direct Inserts**: Raw SQL examples for troubleshooting
- **Permission Verification**: User access checking

## 📊 Key Features

### Correlation ID Tracking
Every operation gets a UUID correlation ID for end-to-end tracking:
```
ℹ️ [a1b2c3d4-e5f6-7890-abcd-ef1234567890] Starting brand creation
🔍 [a1b2c3d4-e5f6-7890-abcd-ef1234567890] PRE-INSERT: Current count: 5
✅ [a1b2c3d4-e5f6-7890-abcd-ef1234567890] POST-INSERT: New count: 6
```

### Comprehensive Error Handling
- Database connection failures
- Schema access issues
- Constraint violations
- Permission problems
- Network connectivity issues

### Environment Flexibility
- Local development support
- Production/Netlify compatibility
- Environment variable detection
- Debug mode toggling

## 🛠️ Files Created/Modified

### New Files
- `BRAVE_API_DEBUG_RUNBOOK.md` - Main debugging guide
- `BRAVE_API_QUICK_REFERENCE.md` - Quick reference card
- `BRAVE_API_DEBUG_SUMMARY.md` - This summary
- `scripts/brave-api-debug.js` - Automated debug script
- `src/app/api/test-brave-integration/route.ts` - Test API endpoint

### Modified Files
- `package.json` - Added debug scripts

## 🎯 Success Criteria

Your debugging system is successful when:

✅ **Canary insert works** - Database connection and permissions verified  
✅ **Row counts increase** - Data persistence confirmed  
✅ **API endpoint returns 200** - Integration working end-to-end  
✅ **Correlation IDs in logs** - Traceability established  
✅ **No constraint violations** - Schema compatibility verified  
✅ **Data persists after insert** - Durability confirmed  

## 🚨 Emergency Commands

```bash
# Quick health check
npm run db:health

# Full debug with verbose logging
DB_DEBUG=true npm run debug:brave:verbose

# Test specific brand creation
curl -X POST localhost:3000/api/test-brave-integration \
  -H "Content-Type: application/json" \
  -d '{"userId":"emergency-test","brandName":"Emergency Brand","websiteUrl":"https://test.com"}'

# Direct database test
psql $DATABASE_URL -c "SELECT count(*) FROM production.brands;"
```

## 📞 Next Steps

1. **Test the system**: Run `npm run debug:brave` to verify everything works
2. **Customize logging**: Adjust log levels and correlation ID format as needed
3. **Monitor in production**: Use the health check endpoint for monitoring
4. **Extend as needed**: Add more specific tests for your Brave API integration

The debugging system is now ready to help you quickly identify and resolve any Brave API integration issues! 🎉
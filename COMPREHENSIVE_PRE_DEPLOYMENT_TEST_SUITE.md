# 🧪 Comprehensive Pre-Deployment Test Suite

## Overview

This test suite is designed to validate **Brave Search & Google CSE API integration** with the **agentic workflow** and **Neon database persistence** before production deployment.

## Critical Issues Addressed

### 1. **API Integration Issues**
- Brave Search API rate limiting and authentication failures
- Google Custom Search Engine quota exhaustion
- Knowledge Graph API connectivity problems
- Fallback mechanism validation

### 2. **Agentic Workflow Problems**
- SelectiveFetchAgent persistence failures
- ProbeHarness validation errors
- Multi-agent coordination issues
- State management during workflow interruptions

### 3. **Neon Database Persistence Issues**
- Connection pooling and timeout handling
- Transaction integrity under load
- Schema drift and missing tables
- Foreign key constraint violations

## Test Suite Architecture

### 📁 Test Files Structure

```
tests/integration/
├── pre-deployment-test-suite.test.ts      # Main comprehensive test suite
├── api-rate-limiting.test.ts              # API integration & rate limiting
├── agentic-workflow-persistence.test.ts   # Workflow persistence verification
├── neon-database-integrity.test.ts        # Database connection & integrity
├── end-to-end-evaluation-flow.test.ts     # Complete evaluation flow
└── performance-load-testing.test.ts       # Performance & load testing

scripts/
└── run-pre-deployment-tests.js            # Test execution orchestrator
```

## Test Coverage Matrix

| Component | API Tests | Workflow Tests | Database Tests | E2E Tests | Performance Tests |
|-----------|-----------|----------------|----------------|-----------|-------------------|
| **Brave Search API** | ✅ Rate limiting<br>✅ Authentication<br>✅ Response validation | ✅ Integration with SelectiveFetchAgent<br>✅ Error handling | ✅ Search result persistence<br>✅ Transaction integrity | ✅ Full evaluation flow | ✅ Concurrent load<br>✅ Memory efficiency |
| **Google CSE API** | ✅ Quota management<br>✅ Fallback logic<br>✅ Schema compliance | ✅ Agent coordination<br>✅ Failure recovery | ✅ Result storage<br>✅ Connection pooling | ✅ End-to-end validation | ✅ Stress testing<br>✅ Resource optimization |
| **Knowledge Graph APIs** | ✅ Wikidata integration<br>✅ Google KG connectivity | ✅ Multi-agent execution<br>✅ State management | ✅ KG data persistence<br>✅ Referential integrity | ✅ Complete workflow | ✅ Performance benchmarks |
| **SelectiveFetchAgent** | ✅ Search integration | ✅ Page fetch persistence<br>✅ Error recovery | ✅ Page blob storage<br>✅ Content validation | ✅ Agent coordination | ✅ Memory usage<br>✅ Concurrent execution |
| **ProbeHarness** | ✅ AI provider integration | ✅ Probe execution<br>✅ Result validation | ✅ Probe run persistence<br>✅ Output storage | ✅ Full evaluation | ✅ AI provider load<br>✅ Response time |
| **EvaluationEngine** | ✅ Provider fallback | ✅ Complete workflow<br>✅ Three-pillar coverage | ✅ Evaluation persistence<br>✅ Score aggregation | ✅ End-to-end flow | ✅ Load handling<br>✅ Resource efficiency |

## Execution Instructions

### Quick Start

```bash
# Run all tests
node scripts/run-pre-deployment-tests.js

# Run specific test suite
node scripts/run-pre-deployment-tests.js --suite=api
node scripts/run-pre-deployment-tests.js --suite=workflow
node scripts/run-pre-deployment-tests.js --suite=database
node scripts/run-pre-deployment-tests.js --suite=e2e
node scripts/run-pre-deployment-tests.js --suite=performance
```

### Individual Test Execution

```bash
# API Rate Limiting & Quota Tests
npx jest tests/integration/api-rate-limiting.test.ts --verbose

# Agentic Workflow Persistence Tests  
npx jest tests/integration/agentic-workflow-persistence.test.ts --verbose

# Database Integrity Tests
npx jest tests/integration/neon-database-integrity.test.ts --verbose

# End-to-End Flow Tests
npx jest tests/integration/end-to-end-evaluation-flow.test.ts --verbose

# Performance & Load Tests
npx jest tests/integration/performance-load-testing.test.ts --verbose
```

## Environment Requirements

### Required Environment Variables
```env
DATABASE_URL=postgresql://username:password@host/database
NEXTAUTH_SECRET=your-nextauth-secret
```

### API Keys (at least one search API and one AI provider required)
```env
# Search APIs (require at least one)
BRAVE_API_KEY=your-brave-search-api-key
GOOGLE_API_KEY=your-google-api-key
GOOGLE_CSE_ID=your-custom-search-engine-id

# AI Providers (require at least one)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
GOOGLE_AI_API_KEY=your-google-ai-key
```

## Test Validation Criteria

### ✅ **PASS Criteria**
- All critical test suites pass
- API rate limiting compliance validated
- Database transactions maintain integrity
- Agentic workflow completes without data corruption
- End-to-end evaluation flow produces realistic scores
- Performance benchmarks met under load

### ❌ **FAIL Criteria**
- Critical API authentication failures
- Database connection pool exhaustion
- Workflow state corruption or data loss
- Evaluation timeouts or incomplete results
- Memory leaks or resource exhaustion
- Performance degradation beyond acceptable limits

## Performance Benchmarks

### API Response Times
- **Brave Search**: < 5 seconds per request
- **Google CSE**: < 8 seconds per request
- **Wikidata**: < 3 seconds per request
- **Google KG**: < 5 seconds per request

### Database Operations
- **Basic queries**: < 2 seconds
- **Complex joins**: < 5 seconds
- **Transaction completion**: < 10 seconds
- **Connection acquisition**: < 1 second

### Evaluation Workflow
- **SelectiveFetchAgent**: < 30 seconds
- **ProbeHarness execution**: < 60 seconds
- **Complete evaluation**: < 120 seconds
- **Status polling response**: < 2 seconds

### Resource Limits
- **Memory usage**: < 200MB increase under load
- **CPU usage**: < 10 seconds total CPU time
- **Database connections**: < 15 concurrent connections
- **API rate compliance**: < 60% of quota usage

## Monitoring & Alerting

The test suite includes built-in monitoring for:

### 🚦 **API Health Monitoring**
- Rate limit compliance tracking
- Quota usage monitoring
- Authentication failure detection
- Response time analysis

### 🤖 **Workflow Health Monitoring**  
- Agent execution success rates
- State consistency validation
- Error recovery effectiveness
- Multi-agent coordination

### 💾 **Database Health Monitoring**
- Connection pool utilization
- Query performance metrics
- Transaction success rates
- Schema integrity validation

## Deployment Decision Matrix

| Test Suite | Status | Criticality | Deployment Impact |
|------------|--------|-------------|-------------------|
| **API Rate Limiting** | Must Pass | Critical | Blocks deployment if failed |
| **Workflow Persistence** | Must Pass | Critical | Blocks deployment if failed |
| **Database Integrity** | Must Pass | Critical | Blocks deployment if failed |
| **End-to-End Flow** | Must Pass | Critical | Blocks deployment if failed |
| **Performance Testing** | Should Pass | Optional | Warning if failed |

## Troubleshooting Guide

### Common Issues & Solutions

#### 🔌 **API Connection Issues**
```
Error: "BRAVE_API_KEY is not set"
Solution: Configure API keys in environment variables
```

```
Error: "Google CSE request failed with status 403"
Solution: Check quota limits and API key permissions
```

#### 🤖 **Workflow Issues**
```
Error: "ProbeHarness validation failed"
Solution: Verify AI provider API keys and model availability
```

```
Error: "SelectiveFetchAgent timeout"
Solution: Check network connectivity and domain accessibility
```

#### 💾 **Database Issues**
```
Error: "Connection pool exhausted"
Solution: Reduce concurrent operations or increase pool size
```

```
Error: "Foreign key constraint violation"
Solution: Verify data relationship integrity and cleanup test data
```

## Pre-Deployment Checklist

### Before Running Tests
- [ ] Environment variables configured
- [ ] Database accessible and migrations applied
- [ ] API keys valid and quotas available
- [ ] Network connectivity verified
- [ ] Test data cleanup completed

### Test Execution
- [ ] All critical test suites pass
- [ ] Performance benchmarks met
- [ ] No memory leaks detected
- [ ] Database integrity maintained
- [ ] API rate limits respected

### Post-Test Validation
- [ ] Test results documented
- [ ] Performance metrics recorded
- [ ] Critical failures resolved
- [ ] Deployment readiness confirmed
- [ ] Monitoring alerts configured

## Success Metrics

### 📊 **Quantitative Metrics**
- **Test Coverage**: 100% of critical components
- **Success Rate**: > 95% for critical tests
- **Performance**: All benchmarks within limits
- **Reliability**: < 5% failure rate under load

### 🎯 **Qualitative Validation**
- Brave & CSE API integration stable
- Agentic workflow maintains data integrity
- Neon database performs reliably
- End-to-end evaluation flow functional
- System ready for production load

## Next Steps After Test Completion

1. **✅ All Tests Pass**: Proceed with production deployment
2. **⚠️ Performance Issues**: Optimize and re-test
3. **❌ Critical Failures**: Fix issues and re-run full suite
4. **📊 Monitoring**: Enable production monitoring and alerting

---

**🚀 This test suite ensures production readiness by validating all critical integration points, workflow persistence, and performance characteristics under realistic load conditions.**
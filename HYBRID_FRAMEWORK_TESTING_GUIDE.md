# 🧪 Hybrid ADI Framework - Local Testing Guide

This guide provides comprehensive instructions for testing the newly implemented Hybrid 10+13 Dimension Framework locally.

## 📋 Quick Start

### Run All Tests
```bash
# Run complete test suite
npm run test:all

# Run hybrid framework specific tests
npm run test:hybrid

# Run with verbose output
npm run test:hybrid:verbose

# Run Jest tests
npm run test

# Run with coverage
npm run test:coverage
```

## 🏗️ Test Suite Components

### 1. **Automated Test Scripts**

#### **Main Test Runner** ([`scripts/test-hybrid-framework.js`](scripts/test-hybrid-framework.js))
- ✅ Build verification
- ✅ TypeScript type checking
- ✅ Hybrid scoring engine tests
- ✅ Agent orchestration validation
- ✅ Brand heritage agent verification
- ✅ Dimension mapping tests
- ✅ Performance benchmarks

#### **Jest Test Suite** ([`tests/hybrid-framework.test.js`](tests/hybrid-framework.test.js))
- ✅ File structure validation
- ✅ Type definition completeness
- ✅ Agent implementation verification
- ✅ Integration testing
- ✅ Performance benchmarks

### 2. **Test Configuration Files**

#### **Jest Configuration** ([`jest.config.js`](jest.config.js))
- Next.js integration
- TypeScript support
- Coverage thresholds
- Module path mapping

#### **Jest Setup** ([`jest.setup.js`](jest.setup.js))
- Mock configurations
- Global test utilities
- Environment setup

## 🎯 Testing Scenarios

### **Scenario 1: Basic Framework Validation**
```bash
# Test that all components are properly integrated
npm run test:hybrid

# Expected output:
# ✅ Build verification
# ✅ Type checking passed
# ✅ Hybrid scoring engine working
# ✅ All 12 agents present
# ✅ Brand heritage agent registered
```

### **Scenario 2: Hybrid Scoring Verification**
```bash
# Test hybrid scoring with mock data
node -e "
const { testHybridScoring } = require('./src/lib/adi/test-hybrid-scoring.ts');
testHybridScoring();
"

# Expected output:
# 📊 Standard Score: XX/100 (X)
# 🎯 Optimization Areas: 13
# 🚨 Critical Areas: X
# ⚡ Quick Wins: X
```

### **Scenario 3: Brand Heritage Analysis**
```bash
# Test brand heritage agent specifically
npm run test -- --testNamePattern="Brand Heritage"

# Expected output:
# ✅ Brand heritage agent methods: 5/5
# ✅ Extends BaseADIAgent correctly
# ✅ Recommendation generation implemented
```

### **Scenario 4: Dimension Mapping Validation**
```bash
# Test dimension mapping completeness
npm run test -- --testNamePattern="Dimension Mapping"

# Expected output:
# ✅ Hybrid types defined: 5/5
# ✅ Brand heritage and conversational copy separated
# ✅ Semantic clarity and ontologies separated
```

## 🔍 Manual Testing Procedures

### **1. Verify 10 Primary Dimensions**
Check that dashboard displays exactly 10 primary dimensions:
1. Schema & Structured Data
2. Semantic Clarity & Ontology
3. Knowledge Graphs & Entity Linking
4. LLM Readability & Conversational Copy
5. Geographic Visibility & Presence
6. AI Answer Quality & Presence
7. Citation Authority & Freshness
8. Reputation Signals
9. Hero Products & Use-Case Retrieval
10. Policies & Logistics Clarity

### **2. Verify 13 Optimization Areas**
Check that detailed reports show 13 optimization areas:
1. Schema & Structured Data
2. **Semantic Clarity** *(separated)*
3. **Ontologies & Taxonomy** *(separated)*
4. Knowledge Graphs & Entity Linking
5. **LLM Readability** *(separated)*
6. **Conversational Copy** *(separated)*
7. Geographic Visibility & Presence
8. AI Answer Quality & Presence
9. Citation Authority & Freshness
10. **Sentiment & Trust** *(separated)*
11. **Brand & Heritage** *(separated)*
12. Hero Products & Use-Case Retrieval
13. Policies & Logistics Clarity

### **3. Test Brand Heritage Recommendations**
Verify brand heritage agent provides specific recommendations:
- Brand story development
- Founder narrative enhancement
- Values articulation
- Heritage timeline creation
- Differentiation messaging

### **4. Test Sub-Dimension Breakdowns**
Verify that primary dimensions properly break down:
- `semantic_clarity_ontology` → `semantic_clarity` + `ontologies_taxonomy`
- `llm_readability_conversational` → `llm_readability` + `conversational_copy`
- `reputation_signals` → `sentiment_trust` + `brand_heritage`

## 🚀 Performance Testing

### **Benchmark Targets**
- **Build Time**: < 60 seconds
- **Type Checking**: < 30 seconds
- **Scoring Calculation**: < 100ms for 1000 operations
- **Agent Orchestration**: < 45 seconds for full evaluation
- **Memory Usage**: < 512MB during testing

### **Performance Test Commands**
```bash
# Measure build performance
time npm run build

# Measure type checking performance
time npm run type-check

# Run performance benchmarks
npm run test -- --testNamePattern="Performance"
```

## 🐛 Troubleshooting

### **Common Issues**

#### **TypeScript Compilation Errors**
```bash
# Fix type issues
npm run type-check
# Look for errors in hybrid types or agent implementations
```

#### **Missing Agent Registration**
```bash
# Verify all agents are registered
grep -r "registerAgent" src/lib/adi/
# Should show all 12 agents including BrandHeritageAgent
```

#### **Dimension Mapping Issues**
```bash
# Check dimension mappings
node -e "
const { AIDI_PRIMARY_TO_OPTIMIZATION_MAPPING } = require('./src/types/adi.ts');
console.log(Object.keys(AIDI_PRIMARY_TO_OPTIMIZATION_MAPPING).length); // Should be 10
"
```

### **Debug Commands**
```bash
# Verbose testing with full output
npm run test:hybrid:verbose

# Test specific components
npm run test -- --testNamePattern="Hybrid"

# Check file structure
npm run test -- --testNamePattern="File Structure"
```

## 📊 Test Coverage Requirements

### **Minimum Coverage Thresholds**
- **Overall**: 70% (branches, functions, lines, statements)
- **ADI Framework**: 80% (branches, functions, lines, statements)
- **Critical Components**: 90% (scoring engine, orchestrator)

### **Coverage Commands**
```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

## ✅ Test Checklist

Before deploying the hybrid framework, ensure all tests pass:

### **Automated Tests**
- [ ] `npm run test:all` passes completely
- [ ] All 12 agents are present and registered
- [ ] Brand heritage agent implements all 5 analysis methods
- [ ] Hybrid scoring engine produces both primary and optimization scores
- [ ] 10 primary dimensions map to 13 optimization areas correctly
- [ ] Type definitions are complete and consistent

### **Manual Verification**
- [ ] Dashboard shows 10 primary dimensions
- [ ] Detailed reports show 13 optimization areas
- [ ] Brand heritage provides specific recommendations
- [ ] Conversational copy is separated from LLM readability
- [ ] Sub-dimension breakdowns work correctly
- [ ] Performance meets benchmark targets

### **Integration Tests**
- [ ] Full evaluation completes successfully
- [ ] All agents execute in correct dependency order
- [ ] Scoring aggregation includes all optimization areas
- [ ] Tracing captures all 13 optimization areas
- [ ] UI components display hybrid scores correctly

## 🎉 Success Criteria

The hybrid framework implementation is successful when:

1. **✅ All automated tests pass** with 100% success rate
2. **✅ Performance benchmarks met** within target thresholds
3. **✅ 13 optimization areas** provide granular guidance
4. **✅ 10 primary dimensions** maintain dashboard simplicity
5. **✅ Brand heritage analysis** delivers specific recommendations
6. **✅ Backward compatibility** maintained with existing code
7. **✅ Type safety** ensured throughout the framework

## 📞 Support

If tests fail or issues arise:

1. **Check the console output** for specific error messages
2. **Run verbose tests** to get detailed debugging information
3. **Verify file structure** matches the expected layout
4. **Check type definitions** for completeness and consistency
5. **Review agent implementations** for proper inheritance and methods

The testing suite is designed to catch issues early and provide clear guidance for resolution.
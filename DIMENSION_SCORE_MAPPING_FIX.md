# Dimension Score Mapping Fix - Debugging 0/100 Display Issue

## 🐛 **Problem Identified**

The frontend was showing **0/100 for all dimension scores**, even though:
- ✅ Agents completed successfully
- ✅ Overall score calculated correctly (50/100)
- ✅ Data saved to database

## 🔍 **Root Cause Analysis**

### **Issue 1: Column Name Mismatch**
**Database schema:**
```typescript
dimensionScores = table('dimension_scores', {
  dimension_name: varchar('dimension_name', { length: 100 }).notNull(),  // ← snake_case
  score: integer('score').notNull(),
  explanation: text('explanation'),  // ← NOT 'description'
})
```

**Old API code (WRONG):**
```typescript
dimensionScores.map((d: any) => ({
  name: d.name,  // ❌ Should be d.dimension_name
  score: d.score,
  description: d.description,  // ❌ Should be d.explanation
  pillar: d.pillar  // ❌ Column doesn't exist in DB
}))
```

### **Issue 2: Missing Pillar Column**
The `dimension_scores` table does **NOT** have a `pillar` column. The pillar must be **derived** from the dimension name using the `ADI_DIMENSION_PILLARS` mapping.

### **Issue 3: Missing pillar_scores Table**
The `production.pillar_scores` table doesn't exist, causing an error:
```
relation "production.pillar_scores" does not exist
```

---

## ✅ **Fixes Applied**

### **Fix 1: Correct Column Mapping**
```typescript
dimensionScores.map((d: any) => {
  const dimensionName = d.dimension_name || d.dimensionName || d.name  // ✅ Handle all formats
  const pillar = ADI_DIMENSION_PILLARS[dimensionName] || 'infrastructure'  // ✅ Derive pillar
  
  return {
    name: dimensionName,
    score: d.score || 0,
    description: d.explanation || d.description || '',  // ✅ Use explanation
    pillar: pillar  // ✅ Derived, not from DB
  }
})
```

### **Fix 2: Derive Pillar Scores from Dimensions**
Instead of querying non-existent `pillar_scores` table:
```typescript
// Derive pillar scores from dimension scores
const derivedPillars = {
  infrastructure: [],
  perception: [],
  commerce: []
}

processedDimensionScores.forEach((d) => {
  if (d.pillar && derivedPillars[d.pillar]) {
    derivedPillars[d.pillar].push(d.score)
  }
})

// Calculate average for each pillar
const pillarScores = {
  infrastructure: avg(derivedPillars.infrastructure),
  perception: avg(derivedPillars.perception),
  commerce: avg(derivedPillars.commerce)
}
```

### **Fix 3: Error Handling for Missing Tables**
```typescript
try {
  pillarScores = await sql`SELECT * FROM production.pillar_scores ...`
} catch (pillarError) {
  console.warn('pillar_scores table missing, deriving from dimensions')
  // Gracefully fall back to derived scores
}
```

### **Fix 4: Comprehensive Logging**
Added logs at each step to trace data flow:
```typescript
console.log(`📊 [Report] Found ${result.length} dimension scores in database`)
console.log(`📊 [Report] Sample dimension score:`, result[0])
console.log(`✅ [Report] Sending report to frontend:`, { dimensionCount, pillarScores, ... })
```

---

## 🎯 **What to Check in Next Test**

### **In Netlify Logs (commit b5d2ff9):**

Look for these log lines:
```
📊 [Report] Found X dimension scores in database
📊 [Report] Sample dimension score: { dimension_name: '...', score: X }
📊 [Report] Deriving pillar scores from X dimension scores
✅ [Report] Derived pillar scores: { infrastructure: X, perception: Y, commerce: Z }
✅ [Report] Sending report to frontend: { dimensionCount: X, ... }
```

### **In Frontend Console:**
```
✅ Final report data: { report: { dimensionScores: [...] } }
```

Check that `dimensionScores` array has items with:
- `name`: String (e.g., "schema_structured_data")
- `score`: Number (not 0)
- `pillar`: String ("infrastructure", "perception", or "commerce")

### **Expected Dimension Names:**
From the `ADI_DIMENSION_PILLARS` mapping:
- `schema_structured_data` → infrastructure
- `semantic_clarity_ontology` → infrastructure
- `knowledge_graphs_entity_linking` → infrastructure
- `llm_readability_conversational` → infrastructure
- `geo_visibility_presence` → perception
- `ai_answer_quality_presence` → perception
- `citation_authority_freshness` → perception
- `reputation_signals` → perception
- `hero_products_use_case` → commerce
- `policies_logistics_clarity` → commerce

---

## 🔬 **Hypothesis**

One of three scenarios:

### **Scenario A: Dimension Scores Not Being Saved**
- Scoring engine is calculating scores
- But `saveDimensionScores()` is failing silently
- **Check:** Look for "Saved X dimension scores" log

### **Scenario B: Scores Are Saved But Zero**
- Dimension scores are being saved as 0
- Agent results not being properly aggregated
- **Check:** Query database directly for actual scores

### **Scenario C: Frontend Mapping Issue (FIXED)**
- Scores exist in DB but API wasn't mapping them correctly
- **Should be fixed now** with correct column names

---

## 🧪 **Database Query to Verify**

Run this on your Neon database:
```sql
SELECT 
  dimension_name,
  score,
  explanation,
  created_at
FROM production.dimension_scores
WHERE evaluation_id = 'fe9c7edd-1d55-4d48-9eff-c12f4ad37898'
ORDER BY score DESC;
```

**Expected:** 8-10 rows with scores between 0-100

---

## 🚀 **Next Steps**

1. **Deploy commit b5d2ff9** (Netlify building now)
2. **Run new evaluation** with Index-Pro tier
3. **Check Netlify logs** for dimension score logging
4. **Verify frontend displays** non-zero scores
5. **If still 0/100:** Query database directly to see if scores are being saved

---

## 💡 **Additional Debugging Added**

The enhanced logging will show:
- ✅ How many dimension scores found in DB
- ✅ Sample dimension score structure
- ✅ Derived vs DB pillar scores
- ✅ Final data sent to frontend

This should help us quickly identify if the issue is:
- Backend scoring logic
- Database persistence
- API mapping
- Frontend rendering

---

**Status:** 🚀 **Deployed** - Commit `b5d2ff9` is pushing to main now.



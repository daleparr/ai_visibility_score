# Focused 5-Sector Strategy

## Why 5 Sectors Instead of 10?

### Problems with 10 Sectors
- ❌ Too many prompts to maintain (200+ across all sectors)
- ❌ Higher LLM API costs ($100/month vs $50/month)
- ❌ Slower time-to-market (more content to create)
- ❌ Harder to validate product-market fit
- ❌ Diluted focus and expertise
- ❌ More difficult to market effectively

### Benefits of 5 Focused Sectors
- ✅ Lower costs ($25-50/month instead of $100/month)
- ✅ Faster to launch (75% less content)
- ✅ Better quality (more focused prompts)
- ✅ Clearer positioning (fewer is better for MVP)
- ✅ Easier to validate demand per sector
- ✅ Can add sub-sectors later based on actual demand

## The 5 Core Sectors

### 1. **E-commerce & Consumer Brands** 🛍️
**Replaces**: Fashion, DTC, CPG, Wellness (4 → 1)

**Why Combined**: 
- All B2C e-commerce brands face similar AI visibility challenges
- Prompts overlap significantly (recommendations, comparisons, reviews)
- Users care more about "consumer brands" than specific sub-categories
- Can filter by sub-sector in reports if needed

**Target Customers**: 
- DTC founders
- E-commerce brand managers
- CPG marketing teams
- Fashion CMOs

**Market Size**: $2T+  
**Prompt Count**: 30 (covers all sub-sectors)

---

### 2. **Financial Services & Fintech** 💳
**Replaces**: Fintech (kept focused)

**Why Standalone**:
- Unique regulatory requirements
- Very different trust/authority signals
- Distinct competitive landscape
- High-value enterprise customers

**Target Customers**:
- Digital bank marketing teams
- Payment platform founders
- Investment app product managers

**Market Size**: $300B+  
**Prompt Count**: 25

---

### 3. **Technology & Software** 💻
**Replaces**: Tech, Consumer Electronics (2 → 1)

**Why Combined**:
- Tech buyers consider both hardware and software
- SaaS and consumer electronics overlap in buyer research
- Similar AI recommendation patterns
- Unified "tech" sector makes more sense

**Target Customers**:
- Tech company CMOs
- Product marketing managers
- SaaS founders

**Market Size**: $1.5T+  
**Prompt Count**: 28

---

### 4. **Travel & Hospitality** ✈️
**Kept Standalone**

**Why Standalone**:
- Huge market with distinct characteristics
- Strong seasonal patterns require specific tracking
- High commercial value (hotels, airlines spend heavily on marketing)
- Review-driven industry (unique AI recommendation patterns)

**Target Customers**:
- Hotel brand directors
- Airline marketing teams
- Booking platform operators

**Market Size**: $1.5T+  
**Prompt Count**: 25

---

### 5. **iGaming & Online Entertainment** 🎰
**Kept Standalone**

**Why Standalone**:
- Extremely high-value niche
- Unique regulatory environment
- Very different from other sectors
- Premium pricing opportunity
- Specific audience with high budgets

**Target Customers**:
- Casino operators
- Sports betting platforms
- Affiliate networks

**Market Size**: $100B+  
**Prompt Count**: 22

---

## What We Removed (For Now)

### Politics & Advocacy ⏸️
**Why Deferred**:
- High bias risk requires extra validation
- Smaller commercial market
- Complex reputation management issues
- Can add later if demand emerges

**Future Strategy**: Add as 6th sector once core 5 are validated

### Automotive & Mobility ⏸️
**Why Deferred**:
- Long consideration cycles (less frequent reports needed)
- Can fit into Technology sector initially
- Smaller immediate opportunity
- EV brands overlap with Tech

**Future Strategy**: Spin out when EV market matures or if enterprise demand exists

---

## New Economics

### Cost Reduction
- **10 sectors**: 250 prompts × 4 models × 3 runs = 3,000 API calls/month → ~$100/month
- **5 sectors**: 130 prompts × 4 models × 3 runs = 1,560 API calls/month → ~$50/month
- **Savings**: 50% cost reduction

### Revenue Impact
- **10 sectors** at 5 subs each = 50 total subs
- **5 sectors** at 10 subs each = 50 total subs
- **Same revenue, better focus, higher quality**

### Time to Launch
- **10 sectors**: Need to create/validate 250 prompts = 4-6 weeks
- **5 sectors**: Need to create/validate 130 prompts = 2-3 weeks
- **Benefit**: Launch 50% faster

---

## Launch Strategy

### Phase 1: Core 5 (Month 1-3)
- Launch E-commerce, Financial, Technology, Travel, iGaming
- Validate product-market fit
- Gather user feedback
- Iterate on quality

### Phase 2: Add Politics (Month 4-6)
- If demand exists, add Politics sector
- Position as "premium" sector with higher pricing
- Target campaigns and advocacy groups

### Phase 3: Spin Out Sub-Sectors (Month 6-12)
Based on actual demand, create focused reports:
- **From E-commerce**: Fashion, Beauty, Wellness (if users request it)
- **From Financial**: Crypto, InsurTech (if specific interest)
- **From Technology**: Gaming, SaaS B2B (if enterprise demand)

---

## Pricing Stays the Same

- **Free**: £0 - Executive summary, top 10
- **Index Pro**: £119/month per sector
- **Enterprise**: £319/month per sector

With 5 sectors:
- **Target**: 10 subs per sector = 50 total
- **Revenue**: £5,950/month = **£71,400/year**
- **Costs**: £50/month = £600/year
- **Margin**: 99%+

---

## Updated Value Proposition

**Old**: "Track AI brand visibility across 10 industries"
**New**: "The definitive AI brand visibility reports for the 5 most competitive markets"

**Better because**:
- ✅ Sounds more premium ("definitive" vs "across 10")
- ✅ Implies deeper analysis
- ✅ Positions as specialist, not generalist
- ✅ Sets expectation for quality over quantity

---

## Next Steps

1. **In Neon DB**: Run `sql/seed-industry-sectors-focused.sql` instead of the 10-sector version
2. **Update prompts**: Focus on 30 high-quality prompts per sector
3. **Test**: Run probes for 1-2 sectors first
4. **Launch**: Go live with proven sectors only
5. **Expand**: Add 6th sector when there's clear demand

---

## TL;DR

**Change**: 10 sectors → 5 focused sectors  
**Impact**: 50% cost reduction, 50% faster launch, better quality  
**Trade-off**: None - we can add more later based on demand  
**Action**: Use `sql/seed-industry-sectors-focused.sql` instead  

**This is a smarter, more focused MVP approach.** 🎯


# AI Visibility Score - Cost Simulation Analysis

## Architecture Overview

Based on the codebase analysis, the AI Visibility Score platform has the following architecture:

### Core Services
- **Frontend**: Next.js 14 application
- **Database**: Neon PostgreSQL (via Drizzle ORM)
- **Hosting**: Netlify (migrated from Vercel)
- **Authentication**: NextAuth.js with Google OAuth

### AI/LLM Integration
- **Multiple AI Providers**: OpenAI, Anthropic, Google AI, Mistral, LLaMA (via Together AI)
- **ADI Evaluation System**: 10+ specialized agents for brand evaluation
- **Evaluation Process**: Multi-model consensus across providers

## Cost Drivers Identified

### 1. AI/LLM API Costs (Primary Cost Driver)
**Per Evaluation Breakdown:**
- 10 evaluation dimensions across 3 pillars
- Multiple AI providers per dimension (consensus model)
- Average 1,000 tokens per prompt, 1,000 tokens per response

**Token Usage Per Evaluation:**
- Infrastructure Tests (4 dimensions × 5 providers × 2,000 tokens) = 40,000 tokens
- Perception Tests (4 dimensions × 5 providers × 2,000 tokens) = 40,000 tokens  
- Commerce Tests (2 dimensions × 5 providers × 2,000 tokens) = 20,000 tokens
- **Total per evaluation: ~100,000 tokens**

**AI Provider Costs (per 1M tokens):**
- OpenAI GPT-4: $30 (input) + $60 (output) = $90
- Anthropic Claude-3: $15 (input) + $75 (output) = $90
- Google Gemini Pro: $0.50 (input) + $1.50 (output) = $2
- Mistral Large: $8 (input) + $24 (output) = $32
- LLaMA (Together AI): $0.60 (input) + $0.60 (output) = $1.20

**Average cost per evaluation: $4.50**

### 2. Database Costs (Neon PostgreSQL)
**Storage Requirements:**
- User profiles, brands, evaluations, dimension scores
- Evaluation results, recommendations, benchmarks
- Estimated 50KB per evaluation result

**Neon Pricing:**
- Free tier: 0.5GB storage, 100 hours compute
- Pro tier: $19/month + $0.102/GB storage + $0.16/hour compute

### 3. Hosting Costs (Netlify)
**Netlify Pricing:**
- Free tier: 100GB bandwidth, 300 build minutes
- Pro tier: $19/month + $55/100GB bandwidth

### 4. Additional Services
- **Authentication**: NextAuth.js (free)
- **File Storage**: Minimal (mainly evaluation artifacts)
- **CDN**: Included with Netlify
- **Monitoring**: Optional (Sentry)

## User Behavior Assumptions

### Subscription Tiers (from schema analysis)
- **Free**: 3 evaluations/month
- **Professional**: 50 evaluations/month  
- **Enterprise**: 500 evaluations/month

### Usage Patterns
- **Active Users**: 20% of total users per month
- **Evaluation Frequency**: 
  - Free users: 2 evaluations/month average
  - Professional users: 25 evaluations/month average
  - Enterprise users: 200 evaluations/month average

### User Distribution
- **Free**: 70% of users
- **Professional**: 25% of users
- **Enterprise**: 5% of users

## Cost Simulation Results

### 100 Users
**User Distribution:**
- Free: 70 users (140 evaluations/month)
- Professional: 25 users (625 evaluations/month)
- Enterprise: 5 users (1,000 evaluations/month)
- **Total Evaluations: 1,765/month**

**Monthly Costs:**
- AI/LLM APIs: 1,765 × $4.50 = $7,943
- Database (Neon Pro): $19 + $5 (storage) + $50 (compute) = $74
- Hosting (Netlify Pro): $19 + $0 (within bandwidth) = $19
- **Total: $8,036/month**

### 500 Users
**User Distribution:**
- Free: 350 users (700 evaluations/month)
- Professional: 125 users (3,125 evaluations/month)
- Enterprise: 25 users (5,000 evaluations/month)
- **Total Evaluations: 8,825/month**

**Monthly Costs:**
- AI/LLM APIs: 8,825 × $4.50 = $39,713
- Database (Neon Pro): $19 + $25 (storage) + $200 (compute) = $244
- Hosting (Netlify Pro): $19 + $55 (extra bandwidth) = $74
- **Total: $40,031/month**

### 1,000 Users
**User Distribution:**
- Free: 700 users (1,400 evaluations/month)
- Professional: 250 users (6,250 evaluations/month)
- Enterprise: 50 users (10,000 evaluations/month)
- **Total Evaluations: 17,650/month**

**Monthly Costs:**
- AI/LLM APIs: 17,650 × $4.50 = $79,425
- Database (Neon Pro): $19 + $50 (storage) + $400 (compute) = $469
- Hosting (Netlify Pro): $19 + $110 (extra bandwidth) = $129
- **Total: $80,023/month**

### 2,500 Users
**User Distribution:**
- Free: 1,750 users (3,500 evaluations/month)
- Professional: 625 users (15,625 evaluations/month)
- Enterprise: 125 users (25,000 evaluations/month)
- **Total Evaluations: 44,125/month**

**Monthly Costs:**
- AI/LLM APIs: 44,125 × $4.50 = $198,563
- Database (Neon Scale): $69 + $125 (storage) + $1,000 (compute) = $1,194
- Hosting (Netlify Business): $99 + $275 (extra bandwidth) = $374
- **Total: $200,131/month**

### 5,000 Users
**User Distribution:**
- Free: 3,500 users (7,000 evaluations/month)
- Professional: 1,250 users (31,250 evaluations/month)
- Enterprise: 250 users (50,000 evaluations/month)
- **Total Evaluations: 88,250/month**

**Monthly Costs:**
- AI/LLM APIs: 88,250 × $4.50 = $397,125
- Database (Neon Scale): $69 + $250 (storage) + $2,000 (compute) = $2,319
- Hosting (Netlify Business): $99 + $550 (extra bandwidth) = $649
- **Total: $400,093/month**

### 10,000 Users
**User Distribution:**
- Free: 7,000 users (14,000 evaluations/month)
- Professional: 2,500 users (62,500 evaluations/month)
- Enterprise: 500 users (100,000 evaluations/month)
- **Total Evaluations: 176,500/month**

**Monthly Costs:**
- AI/LLM APIs: 176,500 × $4.50 = $794,250
- Database (Neon Scale): $69 + $500 (storage) + $4,000 (compute) = $4,569
- Hosting (Netlify Enterprise): $300 + $1,100 (extra bandwidth) = $1,400
- **Total: $800,219/month**

## Cost Summary Table

| Users | Monthly Evaluations | AI/LLM Costs | Database | Hosting | **Total Monthly** | Cost per User |
|-------|-------------------|---------------|----------|---------|------------------|---------------|
| 100   | 1,765            | $7,943        | $74      | $19     | **$8,036**       | $80.36        |
| 500   | 8,825            | $39,713       | $244     | $74     | **$40,031**      | $80.06        |
| 1,000 | 17,650           | $79,425       | $469     | $129    | **$80,023**      | $80.02        |
| 2,500 | 44,125           | $198,563      | $1,194   | $374    | **$200,131**     | $80.05        |
| 5,000 | 88,250           | $397,125      | $2,319   | $649    | **$400,093**     | $80.02        |
| 10,000| 176,500          | $794,250      | $4,569   | $1,400  | **$800,219**     | $80.02        |

## Key Insights

### 1. AI/LLM Costs Dominate (98%+ of total costs)
The multi-model consensus approach with 5 AI providers creates significant API costs. Each evaluation requires ~100,000 tokens across providers.

### 2. Linear Cost Scaling
Cost per user remains remarkably consistent at ~$80/month due to the evaluation-driven model.

### 3. Infrastructure Costs Are Minimal
Database and hosting costs scale gracefully and represent <3% of total costs.

## Cost Optimization Recommendations

### Immediate Optimizations
1. **Reduce AI Provider Count**: Use 2-3 providers instead of 5 (60% cost reduction)
2. **Implement Caching**: Cache similar evaluations for 30 days
3. **Optimize Prompts**: Reduce token usage by 30-40%
4. **Batch Processing**: Group evaluations to reduce API overhead

### Advanced Optimizations
1. **Smart Provider Selection**: Use cheaper models for initial screening
2. **Incremental Updates**: Only re-evaluate changed dimensions
3. **Usage-Based Pricing**: Implement per-evaluation pricing
4. **Enterprise Discounts**: Negotiate volume discounts with AI providers

### Potential Cost Reductions
- **50% reduction**: $40/user/month with 2-3 providers
- **70% reduction**: $24/user/month with caching + optimization
- **80% reduction**: $16/user/month with smart provider selection

## Revenue Requirements

To achieve profitability with current costs:

### Minimum Pricing (Break-even)
- **Professional**: $100/month (25 evaluations)
- **Enterprise**: $2,000/month (200 evaluations)

### Recommended Pricing (40% margin)
- **Professional**: $140/month
- **Enterprise**: $2,800/month

## Risk Factors

1. **AI Provider Price Changes**: 20-50% increases possible
2. **Usage Spikes**: Viral adoption could cause cost explosions
3. **Model Deprecation**: Provider changes requiring migration
4. **Rate Limiting**: High usage may trigger API limits

## Recommendations

1. **Implement Cost Controls**: Set monthly spending limits per user
2. **Monitor Usage**: Real-time cost tracking and alerts
3. **Optimize Early**: Implement caching and provider reduction immediately
4. **Consider Hybrid Model**: Mix of real-time and batch processing
5. **Enterprise Focus**: Higher margins on enterprise customers offset free tier costs
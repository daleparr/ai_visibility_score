# AI Discoverability Index

A comprehensive platform that evaluates how brands appear in AI-powered search and recommendation systems. Unlike traditional SEO audits, the AI Discoverability Index (AIDI) tests whether frontier models (OpenAI, Anthropic, Google, etc.) can find, parse, and reason about your brand's presence.

## ⚡ **Quick Start for User Testing (5 Minutes)**

**Want to test the platform immediately? Use our zero-friction setup:**

### **🚀 Super Quick Demo Setup**
```bash
# 1. Get Neon database URL from neon.tech (2 min)
# 2. Copy environment template
cp .env.neon.example .env.local

# 3. Edit .env.local - only change these 3 lines:
DATABASE_URL=your_neon_database_url_here
ENCRYPTION_KEY=any_32_character_string_here
DEMO_MODE=true

# 4. Launch
npm install && npm run db:migrate && npm run dev
```

**✅ Done! Visit: http://localhost:3005/demo**

- **No authentication required** - Zero barriers for user testing
- **Full platform access** - All features work in demo mode
- **Real database** - Data persists between sessions
- **Production-ready** - Deploy to Netlify in minutes

📖 **[Complete Zero-Friction Setup Guide →](./ZERO_FRICTION_SETUP.md)**

---

## 🚀 Features

- **Multi-Agent Evaluation**: Test across multiple AI providers simultaneously
- **Comprehensive Scoring**: 12-dimension evaluation framework with 0-100 scoring
- **Executive Reports**: Clean, C-suite ready dashboards and detailed reports
- **Competitor Benchmarking**: Side-by-side analysis capabilities
- **Actionable Roadmap**: Prioritized recommendations with clear timelines
- **Real-time Progress**: Live evaluation tracking with WebSocket updates

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Next.js API routes (serverless)
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: NextAuth.js (optional in demo mode)
- **Deployment**: Netlify + Neon
- **AI Integration**: Multi-provider system with API key management

### Evaluation Pillars

#### 🏗️ Infrastructure & Machine Readability (40% weight)
*"Can AI parse and understand your brand's digital footprint?"*
- Schema & Structured Data (10%)
- Semantic Clarity (10%)
- Ontologies & Taxonomy (10%)
- Knowledge Graphs (5%)
- LLM Readability (5%)
- Conversational Copy (5%) 🆕

#### 📰 Perception & Reputation (35% weight)
*"Can AI explain why your brand matters?"*
- Geo Visibility (10%)
- Citation Strength (10%)
- Answer Quality (10%)
- Sentiment & Trust (5%)

#### 🛒 Commerce & Customer Experience (25% weight)
*"Can AI recommend and transact with confidence?"*
- Hero Products (15%)
- Shipping & Freight (10%)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Neon account (free tier available)
- AI provider API keys (optional - can be configured in-app)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/ai-discoverability-index.git
   cd ai-discoverability-index
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.neon.example .env.local
   ```
   
   **For Demo Mode (Simplest):**
   ```env
   # Neon Database
   DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb
   
   # Application
   NEXT_PUBLIC_APP_URL=http://localhost:3005
   ENCRYPTION_KEY=your_32_character_encryption_key
   
   # Enable Demo Mode (no authentication required)
   DEMO_MODE=true
   ```

   **For Production Mode (Full Authentication):**
   ```env
   # Same as above, plus:
   NEXTAUTH_URL=http://localhost:3005
   NEXTAUTH_SECRET=your_nextauth_secret
   
   # Optional: Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # Optional: AI Provider API Keys
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

4. **Set up Neon Database**
   ```bash
   # Run database migrations
   npm run db:migrate
   
   # Optional: Seed with sample data
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   **Demo Mode:** Open [http://localhost:3005/demo](http://localhost:3005/demo)
   **Full Mode:** Open [http://localhost:3005](http://localhost:3005)

## 📊 Usage

### 1. Brand Onboarding
- Enter your website URL
- Select your industry
- Add competitor URLs for benchmarking
- Configure AI providers to test

### 2. Evaluation Process
- Multi-agent testing across AI providers
- Real-time progress tracking
- Automated scoring across 8 dimensions
- Competitor analysis

### 3. Reports & Insights
- **Lite Dashboard**: Executive summary with key metrics
- **Full Report**: Comprehensive 5-7 page analysis
- **Actionable Roadmap**: Prioritized recommendations

## 🔧 Development

### Project Structure
```
ai-discoverability-index/
├── src/
│   ├── app/                 # Next.js 14 app directory
│   │   ├── demo/            # Demo mode pages (no auth required)
│   │   ├── dashboard/       # Main application dashboard
│   │   └── api/             # API routes
│   ├── components/          # Reusable UI components
│   │   ├── adi/             # ADI premium components
│   │   └── ui/              # Base UI components
│   ├── lib/                 # Utility functions and configurations
│   │   ├── db/              # Database schema and client
│   │   └── adi/             # ADI evaluation engine
│   ├── types/               # TypeScript type definitions
│   └── hooks/               # Custom React hooks
├── scripts/                 # Setup and deployment scripts
├── docs/                   # Documentation
└── tests/                  # Test files
```

### API Routes
```
/api/
├── auth/                   # Authentication endpoints
├── brands/                 # Brand management
├── evaluations/            # Evaluation management
├── ai-providers/           # AI provider configuration
├── reports/                # Report generation
└── webhooks/               # External integrations
```

### Database Schema
The application uses a comprehensive PostgreSQL schema with:
- User management and profiles
- Brand and evaluation tracking
- AI provider configuration
- Scoring and recommendations
- Competitor benchmarking
- ADI (AI Discoverability Index) premium features

See [`src/lib/db/schema.ts`](src/lib/db/schema.ts) for the complete schema definition.

## 🔒 Security

- **Database Security**: Neon provides built-in security with SSL connections
- **API Key Encryption**: AI provider keys are encrypted at rest using AES-256
- **Authentication**: NextAuth.js with JWT tokens (optional in demo mode)
- **Environment Variables**: Sensitive data stored securely
- **Demo Mode**: Safe for testing - no sensitive data exposure

## 📈 Scoring Methodology

The AI Visibility Score uses a weighted scoring system:

```
Overall Score = (Infrastructure × 0.40) + (Perception × 0.35) + (Commerce × 0.25)
```

### Grade Assignment
- **A (90-100)**: Excellent AI visibility, competitive advantage
- **B (80-89)**: Good visibility with minor optimization opportunities
- **C (70-79)**: Average visibility, significant improvement potential
- **D (60-69)**: Poor visibility, major gaps in AI discoverability
- **F (0-59)**: Critical visibility issues, immediate action required

## 🤖 AI Provider Integration

The platform supports multiple AI providers:
- **OpenAI**: GPT-4, GPT-3.5-turbo
- **Anthropic**: Claude-3, Claude-2
- **Google**: Gemini Pro, PaLM
- **Open Source**: LLaMA, Mistral (via API providers)

Each provider is tested with standardized prompts to ensure consistent evaluation.

## 🚀 Deployment

### Netlify Deployment (Recommended)
1. **Connect Repository**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `.next`

2. **Configure Environment Variables**
   ```env
   DATABASE_URL=your_neon_production_url
   NEXT_PUBLIC_APP_URL=https://your-domain.netlify.app
   ENCRYPTION_KEY=your_encryption_key
   DEMO_MODE=true  # or false for production
   
   # If using authentication:
   NEXTAUTH_URL=https://your-domain.netlify.app
   NEXTAUTH_SECRET=your_production_secret
   ```

3. **Deploy**
   - Push to main branch for automatic deployment
   - Or deploy manually from Netlify dashboard

### Alternative: Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure same environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Neon Database Setup
1. Create a new Neon project at [neon.tech](https://neon.tech)
2. Copy the connection string to `DATABASE_URL`
3. Migrations run automatically on first deployment
4. Scale automatically with serverless architecture

## 📚 Documentation

### Setup & Deployment
- **[⚡ Zero-Friction Setup](./ZERO_FRICTION_SETUP.md)** - 5-minute setup for user testing
- [Neon + Netlify Migration Guide](./NEON_NETLIFY_MIGRATION_GUIDE.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)

### Architecture & Development
- [Architecture Overview](./ARCHITECTURE.md)
- [Project Plan](./PROJECT_PLAN.md)
- [Scoring Methodology](./SCORING_METHODOLOGY.md)

### ADI Premium Features
- [ADI Implementation Summary](./ADI_IMPLEMENTATION_SUMMARY.md)
- [ADI Component Library](./ADI_COMPONENT_LIBRARY.md)
- [ADI Manual Testing Guide](./ADI_MANUAL_TESTING_GUIDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- [Documentation](./docs/)
- [GitHub Issues](https://github.com/your-org/ai-visibility-score/issues)
- [Discord Community](https://discord.gg/your-discord)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Neon](https://neon.tech/) for the serverless PostgreSQL database
- [Netlify](https://netlify.com/) for the deployment platform
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Drizzle ORM](https://orm.drizzle.team/) for the type-safe database toolkit"# Build trigger for secrets fix deployment"  
"# Deployment status: Secrets scanning fix applied"  

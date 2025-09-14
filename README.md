# AI Visibility Score

A comprehensive platform that evaluates how brands appear in AI-powered search and recommendation systems. Unlike traditional SEO audits, AI Visibility Score tests whether frontier models (OpenAI, Anthropic, Google, etc.) can find, parse, and reason about your brand's presence.

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
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel + Supabase
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
- Supabase account
- AI provider API keys (OpenAI, Anthropic, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/ai-visibility-score.git
   cd ai-visibility-score
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # AI Provider API Keys
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   GOOGLE_AI_API_KEY=your_google_ai_api_key

   # Encryption Key for API Key Storage
   ENCRYPTION_KEY=your_32_character_encryption_key
   ```

4. **Set up Supabase**
   ```bash
   # Install Supabase CLI
   npm install -g @supabase/cli

   # Initialize Supabase (if not already done)
   supabase init

   # Link to your project
   supabase link --project-ref your-project-ref

   # Run migrations
   supabase db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

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
ai-visibility-score/
├── src/
│   ├── app/                 # Next.js 14 app directory
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions and configurations
│   ├── types/               # TypeScript type definitions
│   └── hooks/               # Custom React hooks
├── supabase/
│   ├── migrations/          # Database migrations
│   └── seed.sql            # Initial data
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

See `supabase/migrations/001_initial_schema.sql` for the complete schema.

## 🔒 Security

- **Row Level Security (RLS)**: All database tables use RLS policies
- **API Key Encryption**: AI provider keys are encrypted at rest
- **Authentication**: Supabase Auth with JWT tokens
- **Environment Variables**: Sensitive data stored securely

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

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Supabase Setup
1. Create a new Supabase project
2. Run the migration files
3. Configure RLS policies
4. Set up authentication providers

## 📚 Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Project Plan](./PROJECT_PLAN.md)
- [Scoring Methodology](./SCORING_METHODOLOGY.md)
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)

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
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
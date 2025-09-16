# Live AI Integration Setup Guide

## Overview

The Live AI Integration provides **real AI responses** from OpenAI GPT-4 for premium users, replacing simulated examples with genuine AI interactions.

## Features

### ✅ Tier-Based Access
- **Free Tier**: Simulated examples (existing functionality)
- **Index Pro & Enterprise**: Real AI responses from OpenAI GPT-4

### ✅ Smart Fallback System
- Graceful degradation when OpenAI API is unavailable
- Automatic fallback to simulated responses
- Error handling with user-friendly messages

### ✅ Brand-Specific Prompts
- Dynamic prompts based on brand category and industry
- Contextual AI responses for each AIDI dimension
- Realistic current vs improved scenarios

## Setup Instructions

### 1. OpenAI API Configuration

1. **Get OpenAI API Key**:
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Configure Environment Variables**:
   ```bash
   # Add to your .env.local file
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

3. **For Production (Netlify)**:
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add `OPENAI_API_KEY` with your API key value

### 2. Component Integration

The `AIInteractionExample` component now includes:

- **Real AI Button**: "Get Real AI Response" for paid users
- **Upgrade Prompt**: "Try Real AI" for free users
- **Loading States**: Spinner during AI generation
- **Real AI Badge**: Shows when displaying actual AI responses
- **Error Handling**: User-friendly error messages

### 3. API Endpoints

#### `/api/ai-responses` (POST)
Generates real AI responses for premium users.

**Request Body**:
```json
{
  "brandName": "Tesla",
  "websiteUrl": "https://tesla.com",
  "dimensionName": "Geographic Visibility",
  "brandCategory": {
    "sector": "Automotive",
    "industry": "Electric Vehicles",
    "niche": "Luxury EVs",
    "emoji": "🚗"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "current": "I can find some Tesla locations but...",
    "improved": "Tesla has 3 Supercharger stations near you...",
    "isRealAI": true,
    "provider": "OpenAI GPT-4",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "meta": {
    "userTier": "index_pro",
    "isRealAI": true,
    "provider": "OpenAI GPT-4"
  }
}
```

#### `/api/ai-responses` (GET)
Check user tier and AI availability.

## How It Works

### 1. User Experience Flow

1. **Free Users**:
   - See simulated examples by default
   - Can click "Try Real AI" to see upgrade prompt
   - Redirected to subscription page

2. **Premium Users**:
   - See "Get Real AI Response" button
   - Click to generate live AI responses
   - See loading spinner during generation
   - View real AI responses with "Real AI" badge

### 2. AI Prompt Engineering

The system uses sophisticated prompts to simulate realistic scenarios:

#### Current Knowledge (Limited)
```
You are an AI assistant with limited knowledge about brands. 
Respond as if you have basic, incomplete information about the brand. 
Be honest about limitations and uncertainty.
```

#### Improved Knowledge (Enhanced)
```
You are an AI assistant with comprehensive, well-structured knowledge about brands. 
Provide detailed, accurate, and helpful responses. 
You have access to complete brand information.
```

### 3. Dimension-Specific Queries

Each AIDI dimension has tailored prompts:

- **Geographic Visibility**: Store location queries
- **Citation Strength**: Reputation and media coverage
- **Product Identification**: Product knowledge and specialties
- **Competitive Positioning**: Market comparison analysis
- And 8 more dimensions...

## Cost Management

### OpenAI Usage Optimization

- **Model**: GPT-4 (high quality responses)
- **Max Tokens**: 150-200 per response
- **Temperature**: 0.7 (balanced creativity/consistency)
- **Concurrent Requests**: 2 per user (current + improved)

### Estimated Costs

- **Per AI Response Pair**: ~$0.01-0.02
- **Monthly for 1000 users**: ~$20-40
- **Enterprise scale**: Manageable with usage limits

## Testing

### Local Testing

1. **Set up OpenAI API key** in `.env.local`
2. **Run development server**: `npm run dev`
3. **Test with real brand**: Enter brand URL in evaluation
4. **Sign in as premium user** (or simulate tier)
5. **Click "Get Real AI Response"**
6. **Verify real AI responses** appear

### Production Testing

1. **Deploy with OpenAI API key** configured
2. **Test subscription flow** (sign up for paid tier)
3. **Verify tier-based access** works correctly
4. **Monitor API usage** and costs
5. **Test error handling** (invalid API key, rate limits)

## Monitoring & Analytics

### Logging

The system logs:
- AI response requests by user and tier
- Success/failure rates
- Response times
- API costs per request

### Metrics to Track

- **Conversion Rate**: Free → Paid after trying AI
- **Usage Patterns**: Most popular dimensions
- **Error Rates**: API failures and fallbacks
- **Cost Per User**: OpenAI API expenses

## Security & Best Practices

### API Key Security
- ✅ Server-side only (never exposed to client)
- ✅ Environment variable configuration
- ✅ Conditional initialization (graceful degradation)

### Rate Limiting
- ✅ User authentication required
- ✅ Tier-based access control
- ✅ Error handling for API limits

### Data Privacy
- ✅ No storage of AI responses
- ✅ Brand data only used for prompts
- ✅ User data protected per GDPR

## Troubleshooting

### Common Issues

1. **"OpenAI not configured"**
   - Check `OPENAI_API_KEY` environment variable
   - Verify API key is valid and has credits

2. **"Authentication required"**
   - User must be signed in
   - Check NextAuth configuration

3. **"Tier not supported"**
   - Free users see simulated responses
   - Upgrade to Index Pro or Enterprise

4. **API Rate Limits**
   - OpenAI has usage limits
   - System falls back to simulated responses
   - Consider upgrading OpenAI plan

### Debug Mode

Enable detailed logging:
```bash
# Add to .env.local
DEBUG_AI_RESPONSES=true
```

## Future Enhancements

### Planned Features
- **Multiple AI Providers**: Claude, Gemini integration
- **Response Caching**: Reduce API costs
- **A/B Testing**: Compare AI providers
- **Custom Prompts**: Industry-specific templates
- **Real-time Streaming**: Live response generation

### Scaling Considerations
- **Response Caching**: Store common responses
- **Batch Processing**: Multiple dimensions at once
- **Provider Rotation**: Load balancing across APIs
- **Usage Analytics**: Detailed cost tracking

## Support

For technical issues:
1. Check environment variables
2. Verify user authentication
3. Test API connectivity
4. Review error logs
5. Contact development team

---

**Status**: ✅ Implemented and Ready for Production
**Last Updated**: January 2024
**Version**: 1.0.0
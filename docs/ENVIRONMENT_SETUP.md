# Environment Setup Guide

This guide will help you set up all the necessary environment variables for the MASE AI Platform.

## Quick Start

1. **Copy the environment template:**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. **Set the required variables:**
   \`\`\`env
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.com
   SECRET_KEY=your-super-secret-key
   \`\`\`

3. **Choose your services and add their credentials**

## Required Variables

### Backend Configuration
- `NEXT_PUBLIC_BACKEND_URL` - Your backend API URL (required)
- `NEXT_PUBLIC_APP_URL` - Your frontend URL (defaults to localhost:3000)

### Security
- `SECRET_KEY` - Used for JWT tokens and encryption (required for production)

## Optional Services

### Database (Choose One)
- **PostgreSQL:** `DATABASE_URL` or `POSTGRES_URL`
- **Supabase:** `SUPABASE_URL` + `SUPABASE_ANON_KEY`
- **Neon:** `DATABASE_URL` + `NEON_PROJECT_ID`

### AI Services (Choose One or More)
- **OpenAI:** `OPENAI_API_KEY`
- **Groq:** `GROQ_API_KEY`
- **xAI:** `XAI_API_KEY`
- **Fal AI:** `FAL_KEY`
- **DeepInfra:** `DEEPINFRA_API_KEY`

### GitHub Integration
- `GITHUB_WEBHOOK_SECRET` - For webhook security

### Storage
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage

### Caching/Search
- **Upstash:** `UPSTASH_SEARCH_REST_URL` + `UPSTASH_SEARCH_REST_TOKEN`
- **Redis:** `REDIS_URL` or `KV_URL`

### Authentication
- **Stack Auth:** `NEXT_PUBLIC_STACK_PROJECT_ID` + keys

## Service-Specific Setup

### 1. Database Setup (PostgreSQL)
\`\`\`bash
# Local PostgreSQL
createdb mase_db
export DATABASE_URL="postgresql://user:password@localhost:5432/mase_db"
\`\`\`

### 2. Supabase Setup
1. Create project at [supabase.com](https://supabase.com)
2. Get URL and anon key from Settings > API
3. Add to `.env.local`:
   \`\`\`env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   \`\`\`

### 3. AI Services Setup

#### OpenAI
1. Get API key from [platform.openai.com](https://platform.openai.com)
2. Add to `.env.local`:
   \`\`\`env
   OPENAI_API_KEY=sk-your-key-here
   \`\`\`

#### Groq
1. Get API key from [console.groq.com](https://console.groq.com)
2. Add to `.env.local`:
   \`\`\`env
   GROQ_API_KEY=gsk_your-key-here
   \`\`\`

### 4. GitHub Integration
1. Create webhook secret:
   \`\`\`bash
   openssl rand -hex 32
   \`\`\`
2. Add to `.env.local`:
   \`\`\`env
   GITHUB_WEBHOOK_SECRET=your-generated-secret
   \`\`\`

## Validation

Check your configuration:
\`\`\`bash
npm run env:validate
\`\`\`

Or visit: `http://localhost:3000/api/health`

## Production Deployment

### Vercel
1. Add environment variables in Vercel dashboard
2. Set `NEXT_PUBLIC_BACKEND_URL` to your production backend
3. Ensure `SECRET_KEY` is set to a strong value

### Other Platforms
- Ensure all environment variables are set
- Use production URLs for all services
- Enable SSL/HTTPS for all endpoints

## Troubleshooting

### Common Issues

1. **"Backend not reachable"**
   - Check `NEXT_PUBLIC_BACKEND_URL` is correct
   - Ensure backend is running and accessible

2. **"Database connection failed"**
   - Verify database URL format
   - Check database is running and accessible
   - Ensure credentials are correct

3. **"AI service not available"**
   - Verify API key is correct
   - Check service status
   - Ensure sufficient credits/quota

### Getting Help

1. Check the health endpoint: `/api/health`
2. Review configuration: `/api/config`
3. Check browser console for errors
4. Review server logs

## Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use strong secrets** - Generate with `openssl rand -hex 32`
3. **Rotate keys regularly** - Especially in production
4. **Limit API key permissions** - Use least privilege principle
5. **Monitor usage** - Set up alerts for unusual activity

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_BACKEND_URL` | Yes | Backend API URL | `https://api.example.com` |
| `SECRET_KEY` | Production | JWT/encryption key | `abc123...` |
| `DATABASE_URL` | Optional | Database connection | `postgresql://...` |
| `OPENAI_API_KEY` | Optional | OpenAI API access | `sk-...` |
| `GITHUB_WEBHOOK_SECRET` | Optional | Webhook security | `abc123...` |

For a complete list, see `.env.example`.

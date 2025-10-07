#!/usr/bin/env node

/**
 * Export Netlify Environment Variables for Railway
 * Helps copy environment variables from Netlify to Railway
 */

console.log('📋 Netlify Environment Variables Export')
console.log('======================================')
console.log('')

// List of environment variables to copy from Netlify to Railway
const envVarsToExport = [
  'DATABASE_URL',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'GOOGLE_AI_API_KEY',
  'MISTRAL_API_KEY',
  'BRAVE_API_KEY',
  'PERPLEXITY_API_KEY'
]

console.log('Environment variables found in current environment:')
console.log('================================================')

const foundVars = []
const missingVars = []

envVarsToExport.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    foundVars.push({ name: varName, value })
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`)
  } else {
    missingVars.push(varName)
    console.log(`❌ ${varName}: Not found`)
  }
})

console.log('')

if (foundVars.length > 0) {
  console.log('Railway Commands to Set Variables:')
  console.log('=================================')
  foundVars.forEach(({ name, value }) => {
    console.log(`railway variables set ${name} "${value}"`)
  })
  console.log('')
}

if (missingVars.length > 0) {
  console.log('Missing Variables (need to be set manually):')
  console.log('===========================================')
  missingVars.forEach(varName => {
    console.log(`❌ ${varName}`)
  })
  console.log('')
  console.log('You can find these in your Netlify dashboard:')
  console.log('Site settings → Environment variables')
  console.log('')
}

// Generate Railway setup commands
console.log('Complete Railway Setup Commands:')
console.log('===============================')
console.log('# Core configuration')
console.log('railway variables set NODE_ENV "production"')
console.log('railway variables set PORT "3000"')
console.log('railway variables set LOG_LEVEL "info"')
console.log('')

console.log('# Authentication (CHANGE THESE SECRETS)')
console.log('railway variables set JWT_SECRET "aidi-jwt-secret-2025-production-32-characters-minimum"')
console.log('railway variables set NETLIFY_CALLBACK_SECRET "aidi-callback-secret-2025-production"')
console.log('')

console.log('# Netlify integration')
console.log('railway variables set NETLIFY_CALLBACK_URL "https://ai-visibility-score.netlify.app/.netlify/functions/bridge-callback"')
console.log('railway variables set ALLOWED_ORIGINS "https://ai-visibility-score.netlify.app"')
console.log('')

console.log('# Database and API keys (from your environment)')
foundVars.forEach(({ name, value }) => {
  console.log(`railway variables set ${name} "${value}"`)
})

console.log('')
console.log('# Performance settings')
console.log('railway variables set QUEUE_CONCURRENCY "4"')
console.log('railway variables set MAX_JOB_ATTEMPTS "3"')
console.log('railway variables set JOB_TIMEOUT "600000"')

console.log('')
console.log('After setting all variables, deploy with:')
console.log('railway up')
console.log('')
console.log('Then get your Railway URL with:')
console.log('railway domain')

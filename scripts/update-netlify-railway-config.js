#!/usr/bin/env node

/**
 * Update Netlify Environment Variables for Railway Bridge Integration
 * 
 * This script helps you configure the Netlify environment variables
 * to connect to your Railway service.
 */

const RAILWAY_URL = 'https://aidi-railway-workers-production.up.railway.app'

console.log('🔧 Railway-Netlify Bridge Configuration')
console.log('=====================================')
console.log('')
console.log('Your Railway service is deployed at:')
console.log(`🚀 ${RAILWAY_URL}`)
console.log('')
console.log('Please add/update these environment variables in your Netlify dashboard:')
console.log('(Go to: Site settings > Environment variables)')
console.log('')
console.log('Required Environment Variables:')
console.log('------------------------------')
console.log(`RAILWAY_API_URL=${RAILWAY_URL}`)
console.log(`RAILWAY_URL=${RAILWAY_URL}`)
console.log(`NEXT_PUBLIC_RAILWAY_URL=${RAILWAY_URL}`)
console.log('')
console.log('Authentication Variables (if not already set):')
console.log('--------------------------------------------')
console.log('JWT_SECRET=[your-jwt-secret-here]')
console.log('JWT_TOKEN=[your-jwt-token-here]')
console.log('')
console.log('Bridge Configuration:')
console.log('-------------------')
console.log('NETLIFY_CALLBACK_URL=https://ai-visibility-score.netlify.app/.netlify/functions/bridge-callback')
console.log('NETLIFY_CALLBACK_SECRET=[your-callback-secret-here]')
console.log('')
console.log('✅ After setting these variables, redeploy your Netlify site!')
console.log('')
console.log('🧪 Test the connection with:')
console.log(`curl ${RAILWAY_URL}/health`)
console.log('')


export async function handler() {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ 
      db_url: process.env.DATABASE_URL ? "found" : "missing",
      db_url_length: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
      db_url_starts_with_postgresql: process.env.DATABASE_URL ? process.env.DATABASE_URL.startsWith('postgresql://') : false,
      all_env_vars_count: Object.keys(process.env).length,
      database_related_vars: Object.keys(process.env).filter(key => key.includes('DATABASE')),
      neon_related_vars: Object.keys(process.env).filter(key => key.includes('NEON')),
      node_env: process.env.NODE_ENV
    })
  }
}
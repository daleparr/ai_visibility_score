import { withSchema, sql } from './src/lib/db/index.js';

process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_Wn45TPwKdbkF@ep-little-silence-adftn0q3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

(async () => {
  try {
    console.log('🔍 Fetching recent evaluations...');
    const evaluations = await withSchema(async () => 
      await sql`SELECT id, brand_id, overall_score, status, created_at FROM production.evaluations ORDER BY created_at DESC LIMIT 5`
    );
    
    console.log('\n📊 Recent evaluations:', evaluations);
    
    if (evaluations.length > 0) {
      const evaluationId = evaluations[0].id;
      console.log(`\n🔎 Checking dimension scores for evaluation ${evaluationId}...\n`);
      
      const dimensionScores = await withSchema(async () => 
        await sql`SELECT dimension_name, score, explanation FROM production.dimension_scores WHERE evaluation_id = ${evaluationId} ORDER BY score DESC`
      );
      
      console.log(`\n✅ Found ${dimensionScores.length} dimension scores:\n`, dimensionScores);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
})();
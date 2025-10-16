// Seed prompts for all industry sectors
// Run: npx tsx scripts/seed-industry-prompts.ts

import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

// Import prompt libraries
const PROMPT_LIBRARY: Record<string, Array<{
  promptText: string;
  promptType: 'head' | 'mid-tail' | 'long-tail';
  intentCategory: 'recommendation' | 'comparison' | 'research' | 'troubleshooting';
  geographicScope?: string;
  temporalContext?: string;
  expectedBrandCount?: number;
  biasControls?: any;
  active: boolean;
}>> = {
  igaming: [
    {
      promptText: "What are the most reliable online casinos for real money play in 2025?",
      promptType: 'head',
      intentCategory: 'recommendation',
      geographicScope: 'global',
      temporalContext: '2025',
      expectedBrandCount: 8,
      biasControls: { brandNeutral: true, avoidSuperlatives: true },
      active: true,
    },
    {
      promptText: "I'm looking for sports betting platforms with the best odds and fast payouts. What should I consider?",
      promptType: 'mid-tail',
      intentCategory: 'research',
      geographicScope: 'us',
      temporalContext: 'current',
      expectedBrandCount: 6,
      biasControls: { brandNeutral: true, avoidSuperlatives: true },
      active: true,
    },
    {
      promptText: "Which online poker sites have the largest player pools and best tournament schedules?",
      promptType: 'mid-tail',
      intentCategory: 'comparison',
      expectedBrandCount: 5,
      biasControls: { brandNeutral: true, avoidSuperlatives: true },
      active: true,
    },
  ],
  fashion: [
    {
      promptText: "What are the best minimalist sneaker brands for everyday wear in 2025?",
      promptType: 'head',
      intentCategory: 'recommendation',
      temporalContext: '2025',
      expectedBrandCount: 10,
      biasControls: { brandNeutral: true, avoidSuperlatives: true },
      active: true,
    },
    {
      promptText: "I'm looking for sustainable athleisure brands. What should I consider?",
      promptType: 'mid-tail',
      intentCategory: 'research',
      expectedBrandCount: 8,
      biasControls: { brandNeutral: true, avoidSuperlatives: true },
      active: true,
    },
    {
      promptText: "Which clothing brands offer the best quality-to-price ratio for workwear?",
      promptType: 'mid-tail',
      intentCategory: 'comparison',
      expectedBrandCount: 9,
      biasControls: { brandNeutral: true, avoidSuperlatives: true },
      active: true,
    },
  ],
};

async function seedPrompts() {
  console.log('🌱 Seeding industry sector prompts...\n');
  
  try {
    // Get all sectors
    const sectorsResult = await db.execute(
      sql`SELECT id, slug, name FROM industry_sectors WHERE active = true ORDER BY name`
    );
    
    const sectors = sectorsResult.rows as Array<{ id: string; slug: string; name: string }>;
    
    if (sectors.length === 0) {
      console.error('❌ No sectors found! Run sql/seed-industry-sectors.sql first.');
      process.exit(1);
    }
    
    console.log(`✅ Found ${sectors.length} sectors:\n`);
    sectors.forEach(s => console.log(`   - ${s.name} (${s.slug})`));
    console.log('');
    
    // Seed prompts for each sector
    let totalSeeded = 0;
    
    for (const sector of sectors) {
      const prompts = PROMPT_LIBRARY[sector.slug];
      
      if (!prompts || prompts.length === 0) {
        console.log(`⚠️  No prompts defined for ${sector.slug}, skipping`);
        continue;
      }
      
      console.log(`📝 Seeding ${prompts.length} prompts for ${sector.name}...`);
      
      for (const prompt of prompts) {
        try {
          await db.execute(sql`
            INSERT INTO sector_prompts (
              sector_id, prompt_text, prompt_type, intent_category,
              geographic_scope, temporal_context, expected_brand_count,
              bias_controls, active
            ) VALUES (
              ${sector.id},
              ${prompt.promptText},
              ${prompt.promptType},
              ${prompt.intentCategory},
              ${prompt.geographicScope || null},
              ${prompt.temporalContext || null},
              ${prompt.expectedBrandCount || null},
              ${JSON.stringify(prompt.biasControls || {})},
              ${prompt.active}
            )
            ON CONFLICT DO NOTHING
          `);
          totalSeeded++;
        } catch (err) {
          console.error(`   ❌ Error seeding prompt: ${prompt.promptText.substring(0, 50)}...`, err);
        }
      }
      
      console.log(`   ✅ Completed ${sector.slug}\n`);
    }
    
    console.log(`\n🎉 Successfully seeded ${totalSeeded} prompts across ${sectors.length} sectors!`);
    
    // Show summary
    const summaryResult = await db.execute(sql`
      SELECT s.slug, s.name, COUNT(sp.id) as prompt_count
      FROM industry_sectors s
      LEFT JOIN sector_prompts sp ON s.id = sp.sector_id
      GROUP BY s.id, s.slug, s.name
      ORDER BY s.name
    `);
    
    console.log('\n📊 Prompt counts by sector:');
    summaryResult.rows.forEach((row: any) => {
      console.log(`   ${row.name}: ${row.prompt_count} prompts`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding prompts:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

seedPrompts();


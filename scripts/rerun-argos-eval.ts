import { config } from 'dotenv';
import { resolve } from 'path';
import { eq } from 'drizzle-orm';
import { ADIService } from '../src/lib/adi/adi-service';

// Manually load environment variables
config({ path: resolve(__dirname, '../.env.local') });

// Dynamically import db to ensure env vars are loaded first
async function getDb() {
  const { db } = await import('../src/lib/db');
  return db;
}

async function main() {
    console.log("Starting evaluation rerun for www.argos.co.uk");

    const db = await getDb();
    const { brands } = await import('../src/lib/db/schema');
    
    const brandUrl = "https://argos.co.uk";

    // 1. Find the brand by website_url
    const brandQuery = await db.select().from(brands).where(eq(brands.websiteUrl, brandUrl)).limit(1);
    const brand = brandQuery[0];

    if (!brand) {
        console.error(`Brand with URL "${brandUrl}" not found.`);
        return;
    }
    console.log(`Found brand: ${brand.name} (${brand.id})`);

    // 2. Adi service based evaluation
    console.log("Kicking off ADI Service evaluation...");
    const adi_service = new ADIService();
    const evaluation = await adi_service.evaluateBrand(brand.id, brand.websiteUrl, brand.industry, brand.userId, {});

    if(!evaluation) {
        console.error("Evaluation failed to run");
        return;
    }

    console.log("Evaluation rerun complete.");
    console.log(`Evaluation ID: ${evaluation.orchestrationResult.evaluationId}`);
    console.log(`Brand ID: ${brand.id}`);
}

main().catch(error => {
    console.error("An unexpected error occurred:", error);
});
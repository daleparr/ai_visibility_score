import { db } from '../src/lib/db';
import * as schema from '../src/lib/db/schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// --- DATABASE CONNECTION ---
// Ensure you have a Direct Connection URL from your Neon project.
// The `ssl` mode must be set to `require` for Neon connections.
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_Wn45TPwKdbkF@ep-little-silence-adftn0q3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: {
    rejectUnauthorized: false,
  },
});

const dbWithPool = drizzle(pool, { schema });

// --- HELPER FUNCTIONS ---

/**
 * Creates a new user in the database.
 * @param email - The user's email address.
 * @param name - The user's name.
 * @returns The newly created user.
 */
async function createUser(email: string, name: string) {
  // First, try to find the user.
  let user = await dbWithPool.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
  });

  // If the user doesn't exist, create them.
  if (!user) {
      console.log(`User with email ${email} not found, creating...`);
      [user] = await dbWithPool
          .insert(schema.users)
          .values({ email, name })
          .returning();
      console.log(`Created user: ${user.email} (ID: ${user.id})`);
  } else {
      console.log(`Found existing user: ${user.email} (ID: ${user.id})`);
  }

  return user;
}

/**
 * Creates a subscription for a user.
 * @param userId - The ID of the user.
 * @param tier - The subscription tier ('free', 'index-pro', 'enterprise').
 * @returns The newly created subscription.
 */
async function createSubscription(userId: string, tier: 'free' | 'professional' | 'enterprise') {
    // Check if a subscription already exists for this user.
    let subscription = await dbWithPool.query.adiSubscriptions.findFirst({
        where: (subscriptions, { eq }) => eq(subscriptions.userId, userId as any),
    });

    // If no subscription exists, create one.
    if (!subscription) {
        console.log(`No subscription found for user ${userId}, creating...`);
        [subscription] = await dbWithPool
            .insert(schema.adiSubscriptions)
            .values({ userId, tier })
            .returning();
        console.log(`Created subscription for user ${userId} with tier '${tier}'`);
    } else {
        console.log(`User ${userId} already has a subscription (Tier: ${subscription.tier})`);
    }

    return subscription;
}

// --- MAIN SEEDING LOGIC ---

async function seedTestUsers() {
  console.log('🌱 Seeding test users and subscriptions...');

  try {
    // 1. Create a 'free' tier user
    const freeUser = await createUser('test-free-user@example.com', 'Free User');
    await createSubscription(freeUser.id, 'free');

    // 2. Create an 'professional' tier user
    const proUser = await createUser('test-pro-user@example.com', 'Pro User');
    await createSubscription(proUser.id, 'professional');

    // 3. Create an 'enterprise' tier user
    const enterpriseUser = await createUser('test-enterprise-user@example.com', 'Enterprise User');
    await createSubscription(enterpriseUser.id, 'enterprise');

    console.log('✅ Test users and subscriptions seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding test users:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// -- RUN SCRIPT ---
seedTestUsers();
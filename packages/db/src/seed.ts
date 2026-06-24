import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from workspace root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

const prompts = [
  "A majestic lion resting in the savanna at sunset, cinematic lighting, 4k resolution",
  "Cyberpunk city street in the rain with neon signs reflecting in puddles",
  "A futuristic space station orbiting a ringed exoplanet, highly detailed",
  "A cute baby red panda playing in the snow, soft lighting, photography",
  "A mystical glowing forest with giant mushrooms and fireflies, fantasy concept art",
  "An epic medieval battle scene with knights and a fire-breathing dragon",
  "A cozy modern living room interior design with large windows looking at a forest",
  "Portrait of an astronaut with galaxy reflection in the visor, hyper-realistic",
  "A flying car over a futuristic metropolis at golden hour",
  "Underwater ancient ruins overgrown with glowing coral and fish swimming by",
];

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // 1. Clear existing data
    console.log("🧹 Clearing existing data...");
    await db.delete(schema.videos);
    await db.delete(schema.tenantMembers);
    await db.delete(schema.tenants);
    await db.delete(schema.users);
    
    // 2. Insert Users
    console.log("👤 Creating users...");
    const insertedUsers = await db.insert(schema.users).values(
      Array.from({ length: 10 }).map(() => ({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        avatarUrl: faker.image.avatar(),
      }))
    ).returning();

    // 3. Insert Tenants
    console.log("🏢 Creating tenants...");
    const insertedTenants = await db.insert(schema.tenants).values(
      Array.from({ length: 5 }).map(() => ({
        name: faker.company.name(),
        slug: faker.helpers.slugify(faker.company.name()).toLowerCase() + '-' + faker.string.nanoid(4),
        tier: faker.helpers.arrayElement(['free', 'pro', 'enterprise']) as any,
      }))
    ).returning();

    // 4. Assign Users to Tenants
    console.log("🤝 Assigning users to tenants...");
    const members = [];
    for (const user of insertedUsers) {
      const assignedTenants = faker.helpers.arrayElements(insertedTenants, { min: 1, max: 2 });
      for (const tenant of assignedTenants) {
        members.push({
          tenantId: tenant.id,
          userId: user.id,
          role: faker.helpers.arrayElement(['owner', 'admin', 'member']) as any,
        });
      }
    }
    await db.insert(schema.tenantMembers).values(members);

    // 5. Insert Videos (with random prompts)
    console.log("🎥 Creating videos...");
    const videoData = [];
    for (let i = 0; i < 500; i++) {
      const creator = faker.helpers.arrayElement(insertedUsers);
      const userTenant = members.find(m => m.userId === creator.id);
      
      if (userTenant) {
        videoData.push({
          tenantId: userTenant.tenantId,
          createdBy: creator.id,
          title: faker.lorem.words({ min: 2, max: 6 }),
          prompt: faker.helpers.arrayElement(prompts),
          status: faker.helpers.arrayElement(['pending', 'processing', 'completed', 'failed']) as any,
          videoUrl: faker.internet.url(),
          duration: faker.number.int({ min: 5, max: 60 }),
          createdAt: faker.date.recent({ days: 30 }),
        });
      }
    }
    
    const chunkSize = 100;
    for (let i = 0; i < videoData.length; i += chunkSize) {
      const chunk = videoData.slice(i, i + chunkSize);
      await db.insert(schema.videos).values(chunk);
    }

    console.log(`✅ Seeded ${insertedUsers.length} users, ${insertedTenants.length} tenants, and ${videoData.length} videos.`);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    pool.end();
  }
}

seed();

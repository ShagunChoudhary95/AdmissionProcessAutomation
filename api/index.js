import app from '../server/app.js';
import { connectDB } from '../server/config/db.js';
import { seedData } from '../server/seed.js';

let initPromise = null;

async function ensureReady() {
  if (!initPromise) {
    initPromise = (async () => {
      if (!process.env.ALLOW_MEMORY_FALLBACK) {
        process.env.ALLOW_MEMORY_FALLBACK = 'true';
      }
      const { inMemory } = await connectDB();
      if (inMemory || process.env.SEED_ON_EMPTY === 'true') {
        await seedData();
      }
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

export default async function handler(req, res) {
  await ensureReady();
  return app(req, res);
}

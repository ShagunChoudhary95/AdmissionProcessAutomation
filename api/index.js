let initPromise = null;

async function ensureReady() {
  if (!initPromise) {
    initPromise = (async () => {
      if (!process.env.ALLOW_MEMORY_FALLBACK) {
        process.env.ALLOW_MEMORY_FALLBACK = 'true';
      }
      const [{ default: app }, { connectDB }, { seedData }] = await Promise.all([
        import('../server/app.js'),
        import('../server/config/db.js'),
        import('../server/seed.js'),
      ]);
      const { inMemory } = await connectDB();
      if (inMemory || process.env.SEED_ON_EMPTY === 'true') {
        await seedData();
      }
      return app;
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

module.exports = async function handler(req, res) {
  const app = await ensureReady();
  return app(req, res);
};

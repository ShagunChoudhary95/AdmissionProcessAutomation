import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { seedData } from './seed.js';

const PORT = process.env.PORT || 5000;

connectDB().then(async ({ inMemory }) => {
  if (inMemory || process.env.SEED_ON_EMPTY === 'true') {
    await seedData();
  }
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

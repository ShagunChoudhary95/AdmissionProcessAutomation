import mongoose from 'mongoose';

let memoryServer = null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (uri) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`MongoDB connected: ${mongoose.connection.host}`);
      return { inMemory: false };
    } catch (err) {
      if (process.env.NODE_ENV === 'production' && process.env.ALLOW_MEMORY_FALLBACK !== 'true') {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
      }
      console.warn('Configured MongoDB not reachable, falling back to in-memory MongoDB...');
    }
  } else {
    console.warn('MONGODB_URI not set, starting in-memory MongoDB...');
  }

  const { MongoMemoryServer } = await import('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create();
  const memUri = memoryServer.getUri();
  await mongoose.connect(memUri);
  console.log(`In-memory MongoDB connected: ${memUri}`);
  return { inMemory: true };
}

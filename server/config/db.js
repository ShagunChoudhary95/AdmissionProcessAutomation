import mongoose from 'mongoose';

let memoryServer = null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/admission_automation';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
    return { inMemory: false };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Local MongoDB not reachable, starting in-memory MongoDB for development...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`In-memory MongoDB connected: ${memUri}`);
      return { inMemory: true };
    }
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

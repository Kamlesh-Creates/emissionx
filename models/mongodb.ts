import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn('⚠️ MONGODB_URI not found. Using demo mode without database.');
  // Don't throw error, just warn and continue
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // If no MONGODB_URI, return a mock connection for demo mode
  if (!MONGODB_URI) {
    console.log('🔧 Running in demo mode without database');
    return null;
  }

  // Return cached connection if available and connected
  if (cached.conn) {
    // Check if connection is still alive
    if (mongoose.connection.readyState === 1) {
      return cached.conn;
    }
    // Connection died, reset cache
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 1, // Maintain only 1 connection for serverless (reduces overhead)
      minPoolSize: 1, // Keep at least 1 connection alive
      maxIdleTimeMS: 30000, // Close idle connections after 30s
      serverSelectionTimeoutMS: 5000, // Timeout after 5s (important for serverless)
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      connectTimeoutMS: 10000, // Connection timeout set to 10s
      heartbeatFrequencyMS: 10000, // Send heartbeat every 10s to keep connection alive
      // Optimize for faster connection
      directConnection: false, // Use connection pool (faster for MongoDB Atlas)
      retryWrites: true, // Enable retry writes
      retryReads: true, // Enable retry reads
      // DNS optimization
      family: 4, // Force IPv4 (faster DNS resolution)
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('✅ Connected to MongoDB');
      // Set connection to be less strict about timing
      mongooseInstance.connection.setMaxListeners(0);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;

// Helper function to check if MongoDB is connected
export const isConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

// Helper function to get connection status
export const getConnectionStatus = (): string => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
};

// Helper function to close connection (useful for testing)
export const closeConnection = async (): Promise<void> => {
  if (cached.conn) {
    await mongoose.connection.close();
    cached.conn = null;
    cached.promise = null;
  }
};

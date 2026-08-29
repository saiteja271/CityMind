import mongoose from 'mongoose';

/**
 * MongoDB Mongoose Database Connection & Lifecycle Manager
 * Handles connection establishing, reconnection strategies, connection pool monitoring,
 * and graceful cleanup routines for the CITYMIND platform.
 */

let gridFSBucket = null;

export const connectDB = async (customUri = null) => {
  const mongoURI = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/citymind';
  
  const options = {
    autoIndex: process.env.NODE_ENV !== 'production',
    maxPoolSize: parseInt(process.env.DB_POOL_SIZE || '20', 10),
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
  };

  try {
    mongoose.set('strictQuery', true);
    
    // Register lifecycle hooks before connecting
    mongoose.connection.on('connected', () => {
      console.log(`[Database] MongoDB connected successfully to database: "${mongoose.connection.name}"`);
      initGridFS();
    });

    mongoose.connection.on('error', (err) => {
      console.error(`[Database] MongoDB connection error: ${err.message}`, err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB disconnected. Attempting automatic reconnection...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[Database] MongoDB reconnected successfully.');
    });

    const conn = await mongoose.connect(mongoURI, options);

    console.log(`[Database] Connection established at host: ${conn.connection.host}:${conn.connection.port}`);
    return conn.connection;
  } catch (error) {
    console.error(`[Database] Initial MongoDB connection failed: ${error.message}`);
    // If in development/testing without live MongoDB instance, log fallback mode warning
    if (process.env.ALLOW_DB_FALLBACK === 'true' || process.env.NODE_ENV === 'test') {
      console.warn('[Database] Running in fallback disconnected mode (No active DB connection).');
      return null;
    }
    throw error;
  }
};

/**
 * Initializes GridFS storage bucket for storing heavy city state snapshots
 */
const initGridFS = () => {
  if (mongoose.connection.db) {
    try {
      gridFSBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'city_snapshots'
      });
      console.log('[Database] GridFS Bucket "city_snapshots" initialized.');
    } catch (err) {
      console.error('[Database] Failed to initialize GridFS Bucket:', err.message);
    }
  }
};

/**
 * Returns active GridFS Bucket instance
 */
export const getGridFSBucket = () => {
  return gridFSBucket;
};

/**
 * Retrieves full connection diagnostics and metrics
 */
export const getDBStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const stateCode = mongoose.connection.readyState;
  
  return {
    state: states[stateCode] || 'unknown',
    stateCode,
    dbName: mongoose.connection.name || null,
    host: mongoose.connection.host || null,
    port: mongoose.connection.port || null,
    modelsCount: Object.keys(mongoose.models).length,
    poolSize: mongoose.connection.getClient()?.topology?.s?.options?.maxPoolSize || null
  };
};

/**
 * Gracefully disconnects MongoDB connection
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('[Database] MongoDB connection closed gracefully.');
  } catch (error) {
    console.error(`[Database] Error during MongoDB disconnect: ${error.message}`);
  }
};

export default {
  connectDB,
  disconnectDB,
  getDBStatus,
  getGridFSBucket
};

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI as string;

// NOTE: The Edge runtime can have issues with persistent connections.
// This approach might still work in your environment, but if it doesn't,
// you may need a dedicated Serverless approach or consider hosting
// your database logic in a Node runtime function.

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

// For local dev, use a global variable to preserve the client
// and prevent exhausting connections. But on Edge, this might be moot.
if (process.env.NODE_ENV === 'development') {
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;

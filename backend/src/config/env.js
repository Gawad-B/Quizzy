import dotenv from 'dotenv';

dotenv.config();

const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'FIREBASE_API_KEY'];
const missingVars = requiredVars.filter((name) => !process.env[name]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

export const env = {
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  firebaseApiKey: process.env.FIREBASE_API_KEY,
  // For deployment, set CORS_ORIGIN to frontend domain (comma-separated if multiple)
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

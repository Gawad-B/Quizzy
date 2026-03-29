import dotenv from 'dotenv';

dotenv.config();

const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'FIREBASE_API_KEY'];
const missingVars = requiredVars.filter((name) => !process.env[name]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

if (isProduction && String(process.env.JWT_SECRET || '').length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters in production.');
}

const databaseUrl = String(process.env.DATABASE_URL || '');
const insecureSslModeMatch = databaseUrl.match(/(?:\?|&)sslmode=([^&]+)/i);
const insecureSslMode = insecureSslModeMatch?.[1]?.toLowerCase();
const hasLibpqCompat = /(?:\?|&)uselibpqcompat=true(?:&|$)/i.test(databaseUrl);
const enforceStrictDbSsl = String(process.env.ENFORCE_STRICT_DB_SSL || 'false').toLowerCase() === 'true';

if (isProduction && ['prefer', 'require', 'verify-ca'].includes(String(insecureSslMode || '')) && !hasLibpqCompat) {
  const message = 'In production, DATABASE_URL should use sslmode=verify-full or set uselibpqcompat=true for libpq semantics.';

  if (enforceStrictDbSsl) {
    throw new Error(message);
  }

  console.warn(`[security] ${message} Set ENFORCE_STRICT_DB_SSL=true to enforce this check.`);
}

export const env = {
  nodeEnv,
  isProduction,
  enforceStrictDbSsl,
  port: Number(process.env.PORT || 3000),
  databaseUrl,
  jwtSecret: process.env.JWT_SECRET,
  firebaseApiKey: process.env.FIREBASE_API_KEY,
  // For deployment, set CORS_ORIGIN to frontend domain (comma-separated if multiple)
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

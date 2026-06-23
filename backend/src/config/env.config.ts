import 'dotenv/config';

function requireEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  mongodbUri: requireEnv('MONGODB_URI'),
  appName: requireEnv("APP_NAME"),

  mail: {
    host: requireEnv('MAIL_HOST'),
    user: requireEnv('MAIL_USER'),
    pass: requireEnv('MAIL_PASS'),
  },

  redisUrl: requireEnv('REDIS_URL'),

  jwt: {
    accessTokenSecret: requireEnv('ACCESS_TOKEN_SECRET'),
    refreshTokenSecret: requireEnv('REFRESH_TOKEN_SECRET'),
  },

  frontendUrl: requireEnv('FRONTEND_URL'),
} as const;

export type Config = typeof config;
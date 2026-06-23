import 'dotenv/config';

function requireEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

export const config = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  MONGODB_URI: requireEnv('MONGODB_URI'),
  APP_NAME: requireEnv("APP_NAME"),

  MAIL: {
    HOST: requireEnv('MAIL_HOST'),
    USER: requireEnv('MAIL_USER'),
    PASS: requireEnv('MAIL_PASS'),
  },

  REDIS_URL: requireEnv('REDIS_URL'),

  JWT: {
    ACCESS_TOKEN_SECRET: requireEnv('ACCESS_TOKEN_SECRET'),
    REFRESH_TOKEN_SECRET: requireEnv('REFRESH_TOKEN_SECRET'),
  },

  FRONTEND_URL: requireEnv('FRONTEND_URL'),
} as const;

export type Config = typeof config;
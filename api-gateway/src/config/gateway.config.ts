import { registerAs } from '@nestjs/config';

export interface GatewayConfig {
  port: number;
  jwtSecret: string;
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

export const GATEWAY_CONFIG_KEY = 'gateway';

function requireEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export default registerAs(
  GATEWAY_CONFIG_KEY,
  (): GatewayConfig => ({
    port: parseInt(requireEnv('PORT'), 10),
    jwtSecret: requireEnv('JWT_SECRET'),
    rateLimit: {
      windowMs: parseInt(requireEnv('RATE_LIMIT_WINDOW_MS'), 10),
      maxRequests: parseInt(requireEnv('RATE_LIMIT_MAX_REQUESTS'), 10),
    },
  }),
);

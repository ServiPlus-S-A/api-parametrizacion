import { registerAs } from '@nestjs/config';

export interface ServiceDefinition {
  name: string;
  targetUrl: string;
  requiresAuth: boolean;
}

export const SERVICES_CONFIG_KEY = 'services';

export default registerAs(SERVICES_CONFIG_KEY, (): ServiceDefinition[] => {
  const services: ServiceDefinition[] = [];
  const envVars = process.env;

  const urlPattern = /^SERVICES_([A-Z0-9_]+)_URL$/;

  for (const [key, value] of Object.entries(envVars)) {
    const match = key.match(urlPattern);
    if (match && value) {
      const serviceName = match[1].toLowerCase();
      const authKey = `SERVICES_${match[1]}_AUTH`;
      const requiresAuth = envVars[authKey]?.toLowerCase() !== 'false';

      try {
        new URL(value);
      } catch {
        console.warn(
          `[ServicesConfig] Invalid URL for service "${serviceName}": ${value} — skipping`,
        );
        continue;
      }

      services.push({
        name: serviceName,
        targetUrl: value,
        requiresAuth,
      });
    }
  }

  if (services.length === 0) {
    console.warn(
      '[ServicesConfig] No services registered. Add SERVICES_{NAME}_URL env vars.',
    );
  }

  return services;
});

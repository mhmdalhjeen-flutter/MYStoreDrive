const REQUIRED_ALWAYS = ['DATABASE_URL', 'JWT_SECRET'];
const REQUIRED_IN_PRODUCTION = ['JWT_REFRESH_SECRET'];

const MIN_SECRET_LENGTH = 32;

export function corsOrigins(env: NodeJS.ProcessEnv): string[] {
  const configured = [
    ...(env.CORS_ORIGINS ?? '').split(','),
    env.STORE_FRONTEND_URL ?? '',
    env.ADMIN_FRONTEND_URL ?? '',
  ]
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

  const unique = [...new Set(configured)];

  if (unique.length > 0) {
    return unique;
  }

  if (env.NODE_ENV === 'production') {
    return [];
  }

  return ['http://localhost:3000', 'http://localhost:3002'];
}

export function validateEnv(env: Record<string, unknown>): Record<string, unknown> {
  const isProduction = env.NODE_ENV === 'production';
  const errors: string[] = [];

  const required = [...REQUIRED_ALWAYS, ...(isProduction ? REQUIRED_IN_PRODUCTION : [])];

  for (const key of required) {
    if (!env[key]) {
      errors.push(`${key} is required`);
    }
  }

  if (isProduction) {
    for (const key of ['JWT_SECRET', 'JWT_REFRESH_SECRET']) {
      const value = env[key];
      if (typeof value === 'string' && value.length > 0 && value.length < MIN_SECRET_LENGTH) {
        errors.push(`${key} must be at least ${MIN_SECRET_LENGTH} characters`);
      }
    }

    if (env.JWT_SECRET && env.JWT_SECRET === env.JWT_REFRESH_SECRET) {
      errors.push('JWT_REFRESH_SECRET must differ from JWT_SECRET');
    }

    if (corsOrigins(env as NodeJS.ProcessEnv).length === 0) {
      errors.push('CORS_ORIGINS (or STORE_FRONTEND_URL and ADMIN_FRONTEND_URL) is required');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration:\n  - ${errors.join('\n  - ')}`);
  }

  return env;
}

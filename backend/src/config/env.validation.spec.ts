import { corsOrigins, validateEnv } from './env.validation';

const productionEnv = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://user:pass@host:5432/db',
  JWT_SECRET: 'a'.repeat(48),
  JWT_REFRESH_SECRET: 'b'.repeat(48),
  CORS_ORIGINS: 'https://store.example.com,https://admin.example.com',
};

describe('validateEnv', () => {
  it('accepts a development environment with only the base requirements', () => {
    expect(() =>
      validateEnv({ DATABASE_URL: 'postgresql://localhost:5432/db', JWT_SECRET: 'dev' }),
    ).not.toThrow();
  });

  it('rejects a missing DATABASE_URL', () => {
    expect(() => validateEnv({ JWT_SECRET: 'dev' })).toThrow(/DATABASE_URL is required/);
  });

  it('accepts a complete production environment', () => {
    expect(() => validateEnv({ ...productionEnv })).not.toThrow();
  });

  it('rejects production without a refresh secret', () => {
    const { JWT_REFRESH_SECRET, ...env } = productionEnv;
    expect(() => validateEnv(env)).toThrow(/JWT_REFRESH_SECRET is required/);
  });

  it('rejects production secrets that are short or identical', () => {
    expect(() => validateEnv({ ...productionEnv, JWT_REFRESH_SECRET: 'short' })).toThrow(
      /at least 32 characters/,
    );
    expect(() =>
      validateEnv({ ...productionEnv, JWT_REFRESH_SECRET: productionEnv.JWT_SECRET }),
    ).toThrow(/must differ from JWT_SECRET/);
  });

  it('rejects production without any allowed CORS origin', () => {
    const { CORS_ORIGINS, ...env } = productionEnv;
    expect(() => validateEnv(env)).toThrow(/CORS_ORIGINS/);
  });
});

describe('corsOrigins', () => {
  it('falls back to localhost frontends in development', () => {
    expect(corsOrigins({} as NodeJS.ProcessEnv)).toEqual([
      'http://localhost:3000',
      'http://localhost:3002',
    ]);
  });

  it('returns no origin in production when nothing is configured', () => {
    expect(corsOrigins({ NODE_ENV: 'production' } as NodeJS.ProcessEnv)).toEqual([]);
  });

  it('merges and de-duplicates configured origins without trailing slashes', () => {
    expect(
      corsOrigins({
        CORS_ORIGINS: 'https://store.example.com/, https://admin.example.com',
        STORE_FRONTEND_URL: 'https://store.example.com',
      } as NodeJS.ProcessEnv),
    ).toEqual(['https://store.example.com', 'https://admin.example.com']);
  });
});

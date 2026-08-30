/**
 * Resolve allowed CORS origins for the backend API.
 *
 * Production: set CORS_ORIGINS to a comma-separated list of frontend URLs.
 * Example: https://store.example.pages.dev,https://admin.example.pages.dev
 *
 * Development fallback: STORE_FRONTEND_URL + ADMIN_FRONTEND_URL, then localhost defaults.
 */
export function getCorsOrigins(): string[] {
  const fromList = process.env.CORS_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (fromList?.length) {
    return fromList;
  }

  const origins: string[] = [];
  if (process.env.STORE_FRONTEND_URL) {
    origins.push(process.env.STORE_FRONTEND_URL);
  }
  if (process.env.ADMIN_FRONTEND_URL) {
    origins.push(process.env.ADMIN_FRONTEND_URL);
  }

  if (origins.length > 0) {
    return origins;
  }

  if (process.env.NODE_ENV !== "production") {
    return ["http://localhost:3000", "http://localhost:3002"];
  }

  return [];
}

export function validateCorsOriginsForProduction(): void {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const origins = getCorsOrigins();
  if (origins.length === 0) {
    throw new Error(
      "CORS_ORIGINS (or STORE_FRONTEND_URL + ADMIN_FRONTEND_URL) is required in production",
    );
  }
}

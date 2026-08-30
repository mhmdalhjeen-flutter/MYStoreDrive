#!/usr/bin/env node
/**
 * Phase J deployment helper — requires environment variables (never commit secrets).
 *
 * Usage (after setting env vars):
 *   node scripts/deploy/run-migration-and-seed.js
 *
 * Required env:
 *   DATABASE_URL
 *   SEED_ADMIN_EMAIL
 *   SEED_ADMIN_PASSWORD
 */

const { execSync } = require('child_process');
const path = require('path');

const backendDir = path.join(__dirname, '..', '..');

function requireEnv(name) {
  if (!process.env[name]) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
}

requireEnv('DATABASE_URL');
requireEnv('SEED_ADMIN_EMAIL');
requireEnv('SEED_ADMIN_PASSWORD');

console.log('Running prisma migrate deploy...');
execSync('npx prisma migrate deploy', {
  cwd: backendDir,
  stdio: 'inherit',
  env: process.env,
});

console.log('Running database seed...');
execSync('npm run prisma:seed', {
  cwd: backendDir,
  stdio: 'inherit',
  env: process.env,
});

console.log('Migration and seed completed successfully.');

const { assertProductionApiUrl, getImageRemotePatterns } = require('./next.config.helpers');

assertProductionApiUrl();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: getImageRemotePatterns(),
  },
};

if (process.env.NODE_ENV === 'development') {
  try {
    const { setupDevPlatform } = require('@cloudflare/next-on-pages/next-dev');
    setupDevPlatform();
  } catch {
    // Optional — local dev works without Cloudflare dev platform
  }
}

module.exports = nextConfig;

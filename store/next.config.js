/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || apiUrl;
const imageOrigin = new URL(imageBaseUrl);

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: apiUrl,
  },
  images: {
    remotePatterns: [
      {
        protocol: imageOrigin.protocol.replace(':', ''),
        hostname: imageOrigin.hostname,
        ...(imageOrigin.port ? { port: imageOrigin.port } : {}),
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;

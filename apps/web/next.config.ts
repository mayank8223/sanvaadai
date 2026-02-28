import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enables standalone output for Docker or non-Vercel hosting; omit for Vercel default.
  output: 'standalone',
};

export default nextConfig;

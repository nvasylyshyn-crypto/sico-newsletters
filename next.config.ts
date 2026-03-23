import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/newsletters',
  assetPrefix: '/newsletters',
};

export default nextConfig;

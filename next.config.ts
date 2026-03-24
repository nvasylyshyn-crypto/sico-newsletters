import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/newsletters',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

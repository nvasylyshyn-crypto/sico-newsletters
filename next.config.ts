import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/newsletters',
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

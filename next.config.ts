import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/newsletters',
  trailingSlash: true,
  async rewrites() {
    return [
      { source: '/1h25', destination: '/1h25/index.html' },
      { source: '/1h2025', destination: '/1h2025/index.html' },
      { source: '/1h24', destination: '/1h24/index.html' },
      { source: '/2h23', destination: '/2h23/index.html' },
      { source: '/1q2023', destination: '/1q2023/index.html' },
      { source: '/2h2022', destination: '/2h2022/index.html' },
      { source: '/1h2022', destination: '/1h2022/index.html' },
      { source: '/MailShot', destination: '/MailShot/index.html' },
      { source: '/2h2020', destination: '/2h2020/2h2020-mailshot.html' },
    ];
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

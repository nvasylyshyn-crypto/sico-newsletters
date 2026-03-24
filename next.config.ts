import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  basePath: '/newsletters',
  trailingSlash: true,
  async redirects() {
    return [
      { source: '/1h25', destination: '/1h25/index.html', permanent: false },
      { source: '/1h2025', destination: '/1h2025/index.html', permanent: false },
      { source: '/1h24', destination: '/1h24/index.html', permanent: false },
      { source: '/2h23', destination: '/2h23/index.html', permanent: false },
      { source: '/1q2023', destination: '/1q2023/index.html', permanent: false },
      { source: '/2h2022', destination: '/2h2022/index.html', permanent: false },
      { source: '/1h2022', destination: '/1h2022/index.html', permanent: false },
      { source: '/MailShot', destination: '/MailShot/index.html', permanent: false },
    ];
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

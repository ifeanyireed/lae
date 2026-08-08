import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'resultspro.ng',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.resultspro.ng',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

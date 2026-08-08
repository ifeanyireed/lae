import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.resultspro.ng',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

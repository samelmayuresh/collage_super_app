import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return process.env.NODE_ENV === 'development'
      ? [
        {
          source: '/api/python/:path*',
          destination: 'http://127.0.0.1:8000/api/python/:path*',
        },
      ]
      : [];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export',
  // basePath: '/mandarin-app',
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"]
  }
};

export default nextConfig;

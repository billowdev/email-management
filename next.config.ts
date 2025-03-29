import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
      //  appDir: true, // Ensure App Router is explicitly enabled
    externalDir: true, // Ensure API Routes are explicitly enabled
  },
  // Add this to help with potential trailing slash issues
  trailingSlash: false,
  // Improve build output for debugging
  output: 'standalone',
};

export default nextConfig;
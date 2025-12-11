import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "apod.nasa.gov",
      },
      {
        protocol: "https",
        hostname: "stsci-opo.org",
      },
      {
        protocol: "https",
        hostname: "*.staticflickr.com",
      },
    ],
  },
};

export default nextConfig;

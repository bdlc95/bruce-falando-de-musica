import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  outputFileTracingIncludes: {
    "/": ["./app/generated/prisma/**/*"],
    "/**/*": ["./app/generated/prisma/**/*"],
  },
};

export default nextConfig;
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/atoms": path.resolve(__dirname, "src/atoms"),
      "@/components": path.resolve(__dirname, "src/components"),
      "@/lib": path.resolve(__dirname, "src/lib"),
      "@/styles": path.resolve(__dirname, "src/styles"),
    };
    return config;
  },
};

export default nextConfig;

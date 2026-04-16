import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevents Turbopack from trying to bundle CJS packages like Prisma and ml-kmeans,
  // which causes the server to hang indefinitely during compilation.
  serverExternalPackages: ["@prisma/client", "prisma", "ml-kmeans"],
};

export default nextConfig;

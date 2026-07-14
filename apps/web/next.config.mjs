/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@kingdom/db", "@kingdom/game-engine", "@kingdom/protocol"],
  serverExternalPackages: ["argon2", "@prisma/client"],
};

export default nextConfig;

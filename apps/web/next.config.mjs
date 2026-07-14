/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@kingdom/db", "@kingdom/game-engine"],
  serverExternalPackages: ["argon2", "@prisma/client"],
};

export default nextConfig;

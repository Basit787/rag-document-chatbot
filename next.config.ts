const nextConfig = {
  output: "standalone" as const,
  serverExternalPackages: ["pdf-parse", "@prisma/client"],
};

export default nextConfig;

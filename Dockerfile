# Shared base: Node + pnpm
FROM node:24-alpine AS base
RUN npm install -g pnpm@12.14.0
WORKDIR /app

# Server manifests + Prisma schema/migrations (needed by postinstall `prisma generate`)
FROM base AS server-base
COPY server/package.json server/pnpm-lock.yaml server/pnpm-workspace.yaml server/prisma.config.ts ./
COPY server/prisma ./prisma

# Build the NestJS server with all dependencies
FROM server-base AS server-build
RUN pnpm install --frozen-lockfile
COPY server/ .
RUN pnpm build

# Server runtime: production deps + compiled dist; applies migrations, then starts
FROM server-base AS server
ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile --prod
COPY --from=server-build /app/dist ./dist
EXPOSE 3001
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/main.js"]

# Client: build the Vite app and serve it with `vite preview` (proxies /api to the server)
FROM base AS client
COPY client/package.json client/pnpm-lock.yaml client/pnpm-workspace.yaml client/.npmrc ./
RUN pnpm install --frozen-lockfile
COPY client/ .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "preview", "--host", "0.0.0.0", "--port", "3000"]

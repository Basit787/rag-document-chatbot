import { randomBytes } from 'node:crypto';

export const config = {
  port: Number(process.env.PORT ?? 3001),
  databaseUrl:
    process.env.DATABASE_URL ??
    'postgres://chatbot:chatbot@localhost:5433/chatbot',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11435',
  ollamaModel: process.env.OLLAMA_MODEL ?? 'llama3.2',
  ollamaEmbedModel: process.env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text',
  maxUploadBytes: 15 * 1024 * 1024,
  // Without JWT_SECRET a random one is used, so every restart signs everyone out.
  jwtSecret: process.env.JWT_SECRET || randomBytes(32).toString('hex'),
  sessionTtlSeconds: 7 * 24 * 60 * 60,
  // Browser origins allowed to call the API directly (the client normally goes through its /api proxy).
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  // API docs at /api/docs; off in production unless SWAGGER_ENABLED=true.
  swaggerEnabled:
    process.env.SWAGGER_ENABLED === 'true' ||
    (process.env.SWAGGER_ENABLED !== 'false' &&
      process.env.NODE_ENV !== 'production'),
};

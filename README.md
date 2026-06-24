# RAG Document Chatbot — Production stack

Next.js 15 · **Prisma** · **PostgreSQL** · **shadcn/ui** · **React Hook Form** · Ollama · Docker

## Quick start

```bash
cp .env.example .env
docker compose up --build
```

App: http://localhost:3002

## Local dev (without Docker app container)

```bash
docker compose up postgres -d
npm install
npx prisma migrate dev
npm run dev
```

## Prerequisites

```bash
ollama pull llama3.2
ollama pull nomic-embed-text
```

## Env

See `.env.example`

MIT

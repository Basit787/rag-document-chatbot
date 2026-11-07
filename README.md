# RAG Document Chatbot

Upload PDF, TXT or Markdown files and chat with them on a fully local stack.
Each file is split into chunks, embedded with `nomic-embed-text`, and stored in
Postgres. For every question the closest chunks of your documents go into the
prompt, and the reply lists the files it used. Each user sees only their own
documents and chats.

Example documents with test questions are in [`example/`](example/README.md).

| Part | Stack |
| --- | --- |
| `client/` | React, TanStack Router, Tailwind, react-markdown; served by `vite preview` in Docker |
| `server/` | NestJS, LangChain (`ChatOllama`), LangGraph, Prisma |
| Postgres | Users, chats, documents and chunk embeddings via Prisma (`public` schema); conversation memory via LangGraph `PostgresSaver` (`langgraph` schema) |
| Ollama | Runs in Docker (`alpine/ollama`, a ~70 MB CPU-only image); the models are pulled automatically on first start |

## Run with Docker

```bash
make up                # or: docker compose up -d --build
```

Optional: override models or ports (`OLLAMA_MODEL`, `CLIENT_PORT`, …) in a `.env` file next to `docker-compose.yml`.

Open <http://localhost:3000>. The first start downloads three models and the server waits for them: `llama3.2` (about 2 GB, the default), `smollm2:135m-instruct-q4_0` (135M parameters, about 92 MB, very fast but often wrong about document facts), and the embedding model `nomic-embed-text` (about 270 MB). Pick a chat model in the model menu, then upload documents with the + button left of the message box.

| Command | What it does |
| --- | --- |
| `make up` | Build, pull images and model, start everything |
| `make down` | Stop containers |
| `make restart` | After a code change: rebuild and restart the server and client containers (Postgres and Ollama keep running) |
| `make install` | Install server and client dependencies for local dev (also generates the Prisma client) |
| `make clean` | Remove `node_modules`, `dist` and other build output (keeps Docker volumes) |

Follow logs with `docker compose logs -f`. To add another model: `docker compose exec ollama ollama pull qwen2.5:7b` (it appears in the model picker).

Host ports (set in `.env`):

| Service | Port |
| --- | --- |
| Client | `3000` (`CLIENT_PORT`) |
| Server | `3001` (`SERVER_PORT`) |
| Postgres | `5433` |
| Ollama | `11435` |

Postgres and Ollama use non-default ports so they don't clash with a local install.

## Local development

Each app has its own dependencies and tooling; install them separately.

```bash
cd server && pnpm install    # also runs `prisma generate`
cd client && pnpm install
```

```bash
docker compose up -d postgres ollama ollama-pull   # Postgres + Ollama only
cd server && pnpm db:deploy && pnpm start:dev        # Nest on :3001
cd client && pnpm dev                              # Vite on :3000, proxies /api to :3001
```

### Database

The Prisma schema is in `server/prisma/schema.prisma`, and the connection is in `server/prisma.config.ts` (`DATABASE_URL`). Prisma Client is imported straight from `@prisma/client`. Tables are created by migrations in `server/prisma/migrations/`.

| Command (in `server/`) | What it does |
| --- | --- |
| `pnpm db:migrate --name <change>` | After editing the schema: create a migration and apply it locally |
| `pnpm db:deploy` | Apply pending migrations (no new ones are created) |
| `pnpm db:studio` | Browse data in Prisma Studio |

The Docker image runs `prisma migrate deploy` before starting the app.

### Lint and format

Biome, configured separately in `server/biome.json` and `client/biome.json` (2-space indent, single quotes, semicolons). Run inside either folder:

| Command | What it does |
| --- | --- |
| `pnpm check` | Lint and format check |
| `pnpm fix` | Apply safe fixes and formatting |
| `pnpm lint` | Lint only |
| `pnpm format` | Format only |

## Server environment

| Variable | Default |
| --- | --- |
| `DATABASE_URL` | `postgres://chatbot:chatbot@localhost:5433/chatbot` |
| `OLLAMA_BASE_URL` | `http://localhost:11435` |
| `OLLAMA_MODEL` | `llama3.2` |
| `OLLAMA_SMALL_MODEL` | `smollm2:135m-instruct-q4_0` (pulled by Docker only) |
| `OLLAMA_EMBED_MODEL` | `nomic-embed-text` |
| `PORT` | `3001` |

## API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/models` | Installed Ollama models and the default |
| `GET` | `/api/threads` | Chat list |
| `GET` | `/api/threads/:id/messages` | Messages from the LangGraph checkpoint |
| `DELETE` | `/api/threads/:id` | Delete a thread and its checkpoints |
| `GET` | `/api/documents` | Your uploaded documents |
| `POST` | `/api/documents` | Multipart `file` (`.pdf`, `.txt`, `.md`, max 15 MB); chunks and embeds it |
| `DELETE` | `/api/documents/:id` | Delete a document and its chunks |
| `POST` | `/api/chat` | `{ threadId?, message, model? }`; streams SSE events `thread`, `token`, `done`, `error` |

The `alpine/ollama` image is CPU-only (Docker on macOS has no GPU access anyway). Smaller models (`llama3.2`, `qwen2.5:3b`) respond fastest. For an NVIDIA GPU on Linux, switch both Ollama services to `ollama/ollama`.

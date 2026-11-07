.PHONY: up down restart install clean

up: ## Build, pull images + model, start everything
	docker compose up -d --build

down: ## Stop containers
	docker compose down

restart: ## Rebuild server + client from the current code and restart them (Postgres and Ollama keep running)
	docker compose up -d --build --no-deps server client

install: ## Install server and client deps (server postinstall generates the Prisma client)
	cd server && pnpm install
	cd client && pnpm install

clean: ## Remove installed deps and build output (Docker volumes are kept)
	rm -rf node_modules \
		server/node_modules server/dist server/tsconfig.build.tsbuildinfo \
		client/node_modules client/dist client/.tanstack

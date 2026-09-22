# Astro Starter Monorepo

## 🧞 Commands

All commands are run from the root of the project, from a terminal. Must run commands in a docker container.

There are two methods to run this project:

### Method 1: Run Docker in Powershell

```
docker run --rm -it -v ${PWD}:/app:rw -v /app/node_modules -p 4321:4321 -p 4322:4322 -w /app node:20-alpine sh -c "corepack enable && pnpm install && pnpm dev --host 0.0.0.0"
```

### Method 2: Run Docker Compose and Run in Docker Container

Start the containers.

```
docker compose up -d
```

Exec into the container just started.

```
docker compose exec dev sh
```

Once in the container, start the dev server from /app which is the root working directory.

```
pnpm dev --host 0.0.0.0
```
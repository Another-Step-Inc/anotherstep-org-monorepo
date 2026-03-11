# Astro Starter Monorepo

## 🧞 Commands

All commands are run from the root of the project, from a terminal. Must run commands in a docker container.

```
docker run --rm -it -v ${PWD}:/app:rw -v /app/node_modules -p 4321:4321 -p 4322:4322 -w /app node:20-alpine sh -c "corepack enable && pnpm install && pnpm dev --host 0.0.0.0"
```
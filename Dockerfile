FROM mcr.microsoft.com/playwright:v1.63.0-noble

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable

COPY . .
RUN pnpm install

# API Dockerfile (multi-stage)
FROM node:18-alpine AS build
WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY . .

RUN corepack enable && pnpm install --frozen-lockfile
RUN corepack pnpm --filter @workspace/api-server run build

FROM node:18-alpine
WORKDIR /app
COPY --from=build /workspace/artifacts/api-server/dist /app/dist
EXPOSE 8080
ENV NODE_ENV=production
ENV PORT=8080
CMD ["node", "--enable-source-maps", "./dist/index.mjs"]

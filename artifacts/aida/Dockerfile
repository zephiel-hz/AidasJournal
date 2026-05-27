# Frontend Dockerfile (multi-stage)
FROM node:18-alpine AS build
WORKDIR /workspace

ENV PORT=3000
ENV BASE_PATH=/

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY . .

RUN corepack enable && pnpm install --frozen-lockfile
RUN corepack pnpm --filter @workspace/aida run build

# Serve static files with nginx
FROM nginx:stable-alpine AS production
COPY --from=build /workspace/artifacts/aida/dist/public /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

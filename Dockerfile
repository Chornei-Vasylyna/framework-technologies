# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
WORKDIR /app

# Needed because server.js runs `mysqldump` on startup (see utils/fileStorage.js)
RUN apk add --no-cache mariadb-client

COPY package.json package-lock.json ./


FROM base AS deps-prod
ENV NODE_ENV=production
RUN npm ci --omit=dev


FROM base AS deps-dev
ENV NODE_ENV=development
RUN npm ci


FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache mariadb-client

COPY --from=deps-prod /app/node_modules ./node_modules
COPY . .

RUN mkdir -p data/backups uploads \
  && chown -R node:node /app

USER node
EXPOSE 3000
CMD ["node", "server.js"]


FROM node:24-alpine AS dev
WORKDIR /app
ENV NODE_ENV=development

RUN apk add --no-cache mariadb-client

COPY --from=deps-dev /app/node_modules ./node_modules
COPY . .

RUN mkdir -p data/backups uploads \
  && chown -R node:node /app

USER node
EXPOSE 3000
CMD ["node", "--watch", "server.js"]

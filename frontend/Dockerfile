# Multi-stage build for Next.js
FROM node:20.14-alpine3.20 AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20.14-alpine3.20
WORKDIR /usr/src/app
USER node
COPY --chown=node:node --from=builder /usr/src/app/package*.json ./
COPY --chown=node:node --from=builder /usr/src/app/.next ./.next
COPY --chown=node:node --from=builder /usr/src/app/public ./public
COPY --chown=node:node --from=builder /usr/src/app/node_modules ./node_modules

EXPOSE 3002
CMD ["npm", "run", "start"]

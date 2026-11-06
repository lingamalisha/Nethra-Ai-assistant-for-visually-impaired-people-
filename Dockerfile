# Multi-stage Dockerfile for AI-Powered Accessibility Assistant
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY server.ts ./
COPY tsconfig.json ./

EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]

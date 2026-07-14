FROM node:22 AS base
WORKDIR /app

# install build tools for mediasoup
RUN apt-get update && apt-get install -y python3 make g++

# Builder stage
FROM base AS builder
WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

RUN npm install --omit=dev

EXPOSE 5000
ENV PORT=8080

CMD ["node", "dist/index.js"]
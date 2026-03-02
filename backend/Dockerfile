# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npx prisma generate
RUN npm run build

# ---------- PRODUCTION STAGE ----------
FROM node:20-alpine AS prod
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
# copy helper scripts (for tsx / debugging inside container)
COPY ./scripts ./scripts

EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/index.js"]

# ---------- TEST STAGE (dev deps included) ----------
FROM node:20-alpine AS test
WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npx prisma generate

CMD ["npm", "test"]
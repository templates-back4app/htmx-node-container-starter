# ---- Build stage (installs production deps only; there is no compile step) ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---- Runtime stage ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080

COPY --from=build /app/node_modules ./node_modules
COPY package.json server.js ./
COPY public ./public

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO /dev/null http://127.0.0.1:8080/ || exit 1
USER node
CMD ["node", "server.js"]

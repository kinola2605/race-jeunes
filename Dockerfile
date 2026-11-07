# Image de l'application Race jeunes (Node 22, Alpine).
FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache openssl
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npx prisma generate && npm run build && npm prune --omit=dev --ignore-scripts

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN apk add --no-cache openssl wget && addgroup -S race && adduser -S race -G race
COPY --from=build --chown=race:race /app/package.json /app/next.config.mjs ./
COPY --from=build --chown=race:race /app/node_modules ./node_modules
COPY --from=build --chown=race:race /app/.next ./.next
COPY --from=build --chown=race:race /app/public ./public
COPY --from=build --chown=race:race /app/prisma ./prisma
COPY --from=build --chown=race:race /app/scripts ./scripts
COPY --from=build --chown=race:race /app/src/scoring ./src/scoring
COPY --from=build --chown=race:race /app/src/server/auth/password.ts ./src/server/auth/password.ts
COPY --from=build --chown=race:race /app/tsconfig.json ./tsconfig.json
RUN npx prisma generate && chown -R race:race node_modules/.prisma node_modules/@prisma
USER race
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
ENTRYPOINT ["sh", "scripts/docker-entrypoint.sh"]

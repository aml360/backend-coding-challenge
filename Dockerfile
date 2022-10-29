FROM node:alpine as base
# RUN apk --no-cache add curl
# If pnpm install with npm fails use curl method instead https://pnpm.io/installation#on-alpine-linux
# curl -fsSL "https://github.com/pnpm/pnpm/releases/latest/download/pnpm-linuxstatic-x64" -o /bin/pnpm; chmod +x /bin/pnpm;
RUN npm i -g pnpm


FROM base AS builder
WORKDIR /build
# pnpm fetch does require only lockfile
COPY pnpm-lock.yaml ./
RUN pnpm fetch
COPY ./ ./
# Install all deps, build and then remove dev deps
RUN pnpm i && pnpm run build &&\
  pnpm i -P

FROM node:alpine
WORKDIR /app
COPY --from=builder /build/dist ./dist
COPY --from=builder ["/build/package.json", "./"]
COPY --from=builder /build/node_modules ./node_modules
EXPOSE 3000
CMD [ "npm", "run", "start:prod" ]
# Front end em producao no Cloud Run. Os enderecos das APIs entram no build: NEXT_PUBLIC_* vai para o codigo do navegador.
FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_VIS_API_URL
ARG NEXT_PUBLIC_LOGIN_API_URL
ENV NEXT_PUBLIC_VIS_API_URL=$NEXT_PUBLIC_VIS_API_URL
ENV NEXT_PUBLIC_LOGIN_API_URL=$NEXT_PUBLIC_LOGIN_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app ./
EXPOSE 8080
CMD ["npx", "next", "start", "-p", "8080"]

FROM node:20-slim
RUN corepack enable
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

COPY . .

RUN pnpm install

ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm --filter gateway build

EXPOSE 3000

CMD ["pnpm", "--filter", "gateway", "start"]
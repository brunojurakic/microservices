FROM node:20-slim
RUN corepack enable
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

# Copy the entire monorepo (required for pnpm workspaces to work)
COPY . .

# Install everything
RUN pnpm install

# Build the specific service
RUN pnpm --filter product-service build

EXPOSE 3001
# Run directly from the dist folder
CMD ["node", "apps/product-service/dist/index.js"]
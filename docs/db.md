brew install postgresql
brew services start postgresql

psql -U postgres

CREATE DATABASE cart_db;
CREATE DATABASE product_db;
CREATE DATABASE gateway_db;

add .envs

# Cart Service

pnpm --filter cart-service drizzle:push

# Product Service

pnpm --filter product-service drizzle:push

# Gateway

pnpm --filter gateway drizzle:push

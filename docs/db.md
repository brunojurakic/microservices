# Database Setup

## Prerequisites

```bash
brew install postgresql
brew services start postgresql
```

## Create Databases

Connect to PostgreSQL and create the required databases:

```bash
psql -U postgres
```

```sql
CREATE DATABASE cart_db;
CREATE DATABASE product_db;
CREATE DATABASE gateway_db;
CREATE DATABASE order_db;
```

## Environment Variables

Add the database connection strings to each service's `.env` file.

---

## Push Schemas

### Cart Service

```bash
pnpm --filter cart-service drizzle:push
```

**Tables:**

- `carts` - User shopping carts
- `cart_items` - Items in each cart

---

### Product Service

```bash
pnpm --filter product-service drizzle:push
```

**Tables:**

- `categories` - Product categories
- `products` - Product catalog

---

### Order Service

```bash
pnpm --filter order-service drizzle:push
```

**Tables:**

- `orders` - User orders with status and total amount
- `order_items` - Line items for each order (productId, quantity, priceAtPurchase)

---

### Gateway

```bash
pnpm --filter gateway drizzle:push
```

**Tables:**

- `role` - User roles (admin, regular)
- `user` - User accounts with roleId reference
- `session` - Active user sessions
- `account` - OAuth/credential accounts
- `verification` - Email verification tokens
- `jwks` - JSON Web Key Set for JWT signing

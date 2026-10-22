# REST API

Simple Node.js + Express REST API for testing. Data lives in memory (loaded from `data/`).

## Requirements

- Node.js 24+

## Setup

```bash
npm install
```

## Run

```bash
# development (auto-restart on file changes)
npm run dev

# production
npm start
```

Port defaults to `3000`. Override with `PORT`:

```bash
PORT=4000 npm start
```

## Endpoints

### Health

```bash
curl http://localhost:3000/health
```

### List users

```bash
curl http://localhost:3000/users
```

Filter by role:

```bash
curl "http://localhost:3000/users?role=admin"
```

### Get user by id

```bash
curl http://localhost:3000/users/1
```

### Create user

Requires `name` and `email`. Optional `role` (defaults to `"user"`).

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Sam Taylor","email":"sam@example.com","role":"user"}'
```

### List products

```bash
curl http://localhost:3000/products
```

Filter by category:

```bash
curl "http://localhost:3000/products?category=electronics"
```

Filter to in-stock only:

```bash
curl "http://localhost:3000/products?inStock=true"
```

Combine filters:

```bash
curl "http://localhost:3000/products?category=electronics&inStock=true"
```

### Get product by id

```bash
curl http://localhost:3000/products/1
```

## Errors

Errors use a consistent JSON shape:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "User with id 999 not found"
  }
}
```

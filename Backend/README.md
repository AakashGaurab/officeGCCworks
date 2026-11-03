# Catalogue Backend

Node.js + TypeScript API (Fastify, zod) that serves the product catalogue. The client only talks to this
service; it never calls the Fake Store API directly.

## Install, run, test

```bash
npm install
cp .env.example .env   # optional, all values have defaults
npm run dev            # watch mode on http://localhost:3001
npm test               # unit + HTTP tests, no real network
npm run lint
npm run typecheck
npm run build && npm start
```

Environment variables (see `.env.example`): `PORT`, `FAKE_STORE_API_BASE_URL`, `CORS_ORIGIN`.

## Endpoints (prefix `/api`)

| Method | Path | Description |
|---|---|---|
| GET | `/health` | `{ "status": "ok" }` |
| GET | `/products/featured` | Top 5 products by rating |
| GET | `/products?category=&search=&page=&pageSize=` | Paginated list. `search` is a case-insensitive match on the title. Defaults: page 1, pageSize 10 (max 50, larger values are clamped) |
| GET | `/products/:id` | One product. 400 for an invalid id, 404 if missing |
| GET | `/categories` | Category names |
| GET | `/categories/:category/products?page=&pageSize=` | `{ topRated (top 4), items (the rest, paginated), page, pageSize, total, hasNextPage }`. 404 for an unknown category. `topRated` is always returned but is only meaningful on page 1 |

Ordering is always rating desc, then rating count desc, then id asc, so results are stable.

Errors share one shape: `{ "error": { "code": "...", "message": "..." } }` with status 400 (validation),
404 (not found) or 502 (data source failure). Stack traces are never returned.

## Architecture

```
http  ->  application  ->  domain  <-  infrastructure
routes    CatalogueService  Product,        FakeStoreProductRepository
schemas   sort/search/      ProductRepository (implements the port)
errors    paginate helpers  (interface)
```

Dependencies point inward. `CatalogueService` only knows the `ProductRepository` interface.
`src/app.ts` is the composition root (builds the app from injected dependencies) and `src/server.ts`
reads the environment and starts it.

## Adding a new ProductRepository

1. Create a class that implements `ProductRepository` (`getAll`, `getById`, `getCategories`) in
   `src/infrastructure/`, for example `DatabaseProductRepository`. Map your data to the domain `Product`
   and throw `UpstreamError` when the source fails.
2. In `src/server.ts`, pass an instance as `productRepository` to `buildApp`.

Nothing in `application` or `http` changes. `tests/helpers/InMemoryProductRepository.ts` is a minimal example.

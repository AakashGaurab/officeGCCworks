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

Environment variables (see `.env.example`):

| Variable | Default | Meaning |
|---|---|---|
| `PORT` | 3001 | HTTP port |
| `FAKE_STORE_API_BASE_URL` | https://fakestoreapi.com | Product source |
| `CORS_ORIGIN` | http://localhost:5173 | Allowed browser origin |
| `SALES_INBOX_EMAIL` | sales@example.com (log provider only) | Where enquiry emails go (must be a valid email). Required explicitly for `EMAIL_PROVIDER=smtp` |
| `DATABASE_PATH` | ./data/enquiries.sqlite | SQLite file, the directory is created automatically |
| `EMAIL_PROVIDER` | log | `log` (default) or `smtp` |
| `SMTP_HOST`, `SMTP_PORT` (587), `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | - | Only for `EMAIL_PROVIDER=smtp` (`SMTP_HOST`, `EMAIL_FROM` and `SALES_INBOX_EMAIL` required; `SMTP_USER` and `SMTP_PASS` only together) |
| `ADMIN_TOKEN` | not set | Enables the admin API when set (at least 16 characters, startup fails otherwise). An empty value counts as not set. See Admin API |
| `TRUST_PROXY` | false | Set `true` only behind a trusted proxy, see rate limiting |

SQLite uses Node's built-in `node:sqlite` (Node 24+), so there is no native build step. The `data/` folder and
`*.sqlite` files are git-ignored.

## Endpoints (prefix `/api`)

| Method | Path | Description |
|---|---|---|
| GET | `/health` | `{ "status": "ok" }` |
| GET | `/products/featured` | Top 5 products by rating |
| GET | `/products?category=&search=&page=&pageSize=` | Paginated list. `search` is a case-insensitive match on the title. Defaults: page 1, pageSize 10 (max 50, larger values are clamped) |
| GET | `/products/:id` | One product. 400 for an invalid id, 404 if missing |
| GET | `/categories` | Category names |
| GET | `/categories/:category/products?page=&pageSize=` | `{ topRated (top 4), items (the rest, paginated), page, pageSize, total, hasNextPage }`. 404 for an unknown category. `topRated` is always returned but is only meaningful on page 1 |

### POST `/api/enquiries`

Body: `productId` (positive integer), `name` (1-100, trimmed), `email` (valid, max 254), `phone` (optional,
7-20 characters, digits, spaces and `+ - ( )`), `message` (1-1000, trimmed) and `website` (honeypot, leave
empty, max 200). The name may not contain control characters. Returns `201 { "id": "...", "status": "received" }`. The internal email status is never exposed.
Errors: 400 invalid body (also a body over 8 KB, which fits a 1000 character message in UTF-8 plus the other fields), 404 unknown product, 429 too many requests
(`RATE_LIMITED`).

How it works (`EnquiryService`):

1. If `website` is filled in it is a bot: respond 201 and do nothing (nothing stored, nothing sent). A
   warn-level log line (no customer data) records that a submission was dropped. Trade-off: the field is
   called `website` on purpose, so a browser autofill can fill it and silently drop a real customer. It is
   hidden, `autocomplete="off"` and skipped by keyboard, which keeps this rare.
2. Check the product exists (`ProductRepository`), else 404.
3. **Save the enquiry to the database first** with status `pending` (a snapshot of product id and title).
   If this fails the request fails with 500, because nothing is safe yet.
4. Send the email to `SALES_INBOX_EMAIL` and mark the row `sent`.
5. If the email fails the row is marked `failed` with a short error, the error is logged, and the customer
   **still gets 201**: the enquiry is stored and can be retried or read from the database.

The email is plain text only (customer input is never rendered as HTML) with `Reply-To` set to the
customer. Header injection is blocked twice: validation rejects line breaks in name and email, and the
email builder replaces line breaks in the subject and reply-to with spaces.

Rate limiting (`@fastify/rate-limit`): 5 enquiries per minute per client IP, only on this route. Behind a
load balancer every request appears to come from the proxy's IP unless `TRUST_PROXY=true`; enable it only
when a trusted proxy sets `X-Forwarded-For`, otherwise clients could fake their address. The counter is
kept in memory, so with several instances each has its own limit (use a shared store such as Redis then).

## Admin API (disabled by default)

`GET /api/admin/enquiries?status=&page=&pageSize=` lists all stored enquiries for the site owner.

- **Disabled unless `ADMIN_TOKEN` is set.** Without it the route is not registered at all (404). There is no
  built-in default password. Generate a token with `openssl rand -hex 24`.
- **Auth:** `Authorization: Bearer <token>`. `requireAdminToken.ts` hashes both values with SHA-256 and compares
  them with `crypto.timingSafeEqual`, so neither the length nor the content leaks through timing. Any failure
  (missing header, wrong scheme, wrong token, extra whitespace) gives the same `401 UNAUTHORIZED` with a generic message.
  Future admin routes are protected by registering them inside `registerAdminRoutes` (the hook applies to the whole scope).
- **Logging:** the token and the `Authorization` header are never logged. Fastify's default request log only
  records method, url, host and remote address; a test checks this.
- **Brute force:** 30 requests per minute per IP on the admin routes (429 `RATE_LIMITED`). Same `TRUST_PROXY` caveat as above.
- **Caching:** admin responses send `Cache-Control: no-store` because they contain personal data.
- **Query:** `status` (`pending`, `sent`, `failed`, optional), `page` (default 1), `pageSize` (default 20, max 100,
  larger values are a 400). Newest first.
- **Response:** `{ items, page, pageSize, total, hasNextPage, statusCounts: { pending, sent, failed } }`.
  `statusCounts` covers all enquiries regardless of the `status` filter, so a UI can show counts on its tabs.

`EnquiryRepository` has two read methods for this: `findPage` and `countByStatus` (indexed on `created_at`).

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

Enquiries add two more ports in `src/domain`: `EnquiryRepository` (`SqliteEnquiryRepository`) and
`EmailSender` (`LogEmailSender`, `SmtpEmailSender`). `EnquiryService` only knows these interfaces.

Dependencies point inward. `CatalogueService` only knows the `ProductRepository` interface.
`src/app.ts` is the composition root (builds the app from injected dependencies) and `src/server.ts`
reads the environment and starts it.

## Adding a new ProductRepository

1. Create a class that implements `ProductRepository` (`getAll`, `getById`, `getCategories`) in
   `src/infrastructure/`, for example `DatabaseProductRepository`. Map your data to the domain `Product`
   and throw `UpstreamError` when the source fails.
2. In `src/server.ts`, pass an instance as `productRepository` to `buildApp`.

Nothing in `application` or `http` changes. `tests/helpers/InMemoryProductRepository.ts` is a minimal example.

## Swapping the email sender or the enquiry database

No email service costs money here, so the default `LogEmailSender` is a **development stand-in**: it only logs
the enquiry id, subject, recipient and body length (no customer data). Do not use it in production, nothing is
delivered. `SmtpEmailSender` (nodemailer) is ready and selected with `EMAIL_PROVIDER=smtp` plus the `SMTP_*`
and `EMAIL_FROM` variables (connection, greeting and socket timeouts of a few seconds, so a dead SMTP server
cannot hang the request). For another provider (for example SES on AWS):

1. Implement `EmailSender` (`send(message)`, throw on failure) in `src/infrastructure/`.
2. Return it from `createEmailSender` in `src/infrastructure/createEmailSender.ts`, the one swap point.

To replace SQLite (for example with Postgres on RDS) implement `EnquiryRepository` (`save`, `markSent`,
`markFailed`, `findUnsent`, `findPage`, `countByStatus`, `close`) and pass it as `enquiryRepository` in `src/server.ts`. The app closes it
on shutdown.

## Next step: retry failed emails

`EnquiryRepository.findUnsent()` returns `pending` and `failed` enquiries, oldest first. A scheduled job
(not built yet) can loop over it, send each email again, and call `markSent`. `pending` rows that stay
around mean the process stopped between saving and sending.

Rows can be left behind in two ways, and both need that retry job:

- The process died after saving and before sending: the row stays `pending`.
- The email was sent but `markSent` failed (the failure is only logged): the row stays `pending` although the
  email went out, so a retry can send a **duplicate**. Accepting a rare duplicate was chosen over losing an
  enquiry; the job (or the sales team) should be aware of it.

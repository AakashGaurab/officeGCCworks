# Product Catalogue

A product catalogue where customers browse, search and send an enquiry about a product. It is a proof of concept built to grow: the product data source, the look and feel, and the email provider can each be replaced without rewriting the rest.

- **Home:** the 5 top-rated products.
- **Category page:** the top 4 rated products in the category, then the rest with infinite scroll (10 per page).
- **Search:** case-insensitive match on the product title, with infinite scroll.
- **Product page:** full details and an **Enquire** form.
- **Enquiry:** saved to a database first, then emailed to the sales inbox. The customer sees a "Thank you" message.

## Stack and why

| Layer | Choice | Why |
|---|---|---|
| Client | React + TypeScript (Vite) | Typed components, fast tooling, plain CSS with one theme file so the look can change |
| Backend | Node.js + TypeScript (Fastify, zod) | One language across the stack, schema validation at the edge, small and fast |
| Storage | SQLite (Node's built-in `node:sqlite`) | Needs no extra service or account, so the reviewer can run it instantly. Behind an interface so Postgres can replace it |
| Tests | Vitest (both sides), React Testing Library | Same runner everywhere, quick feedback |
| Packaging | Docker + docker compose | One command to run |

## Run it (under 10 minutes)

### Option 1: Docker (one command)

Requires Docker with Compose.

```bash
docker compose up --build
```

- Web app: http://localhost:5173
- API: http://localhost:3001/api/health

No `.env` file is needed. Every setting has a default. To override, copy `.env.example` to `.env`.

No email is actually sent (see [Email](#email)). Enquiries are saved to the database, and the email that would be sent is written to the backend log:

```bash
docker compose logs backend
```

Saved enquiries live in a Docker volume (`enquiry-data`) and survive restarts. `docker compose down -v` deletes them.

### Option 2: run without Docker

Requires Node.js 24 or newer. Use two terminals.

```bash
# Terminal 1: API on http://localhost:3001
cd Backend
cp .env.example .env
npm install
npm run dev

# Terminal 2: web app on http://localhost:5173
cd Frontend
cp .env.example .env
npm install
npm run dev
```

### Run the tests

```bash
cd Backend && npm test      # 135 tests
cd Frontend && npm test     # 105 tests
```

Tests mock all HTTP calls, so none needs the network. Each project also has `npm run typecheck`, `npm run lint` and `npm run build`.

## Configuration

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `SALES_INBOX_EMAIL` | Backend | `sales@example.com` | Where enquiry emails go |
| `EMAIL_PROVIDER` | Backend | `log` | `log` writes the email to the log. `smtp` sends it (see [Email](#email)) |
| `DATABASE_PATH` | Backend | `./data/enquiries.sqlite` | SQLite file location |
| `CORS_ORIGIN` | Backend | `http://localhost:5173` | Address the web app is served from |
| `TRUST_PROXY` | Backend | `false` | Set `true` only behind a trusted load balancer, so rate limiting sees real client IPs |
| `FAKE_STORE_API_BASE_URL` | Backend | `https://fakestoreapi.com` | Product data source |
| `VITE_API_BASE_URL` | Frontend | `http://localhost:3001/api` | Where the browser finds the API. Set at build time |

There are no secrets in this repository. `.env` files are ignored by Git. The full list, including the SMTP settings, is in `Backend/.env.example`.

## Architecture

```
Browser (React)  ──HTTP──▶  Backend API (Fastify)  ──▶  Product data source (Fake Store API)
                                    │
                                    ├──▶  Enquiry database (SQLite)
                                    └──▶  Email (log by default, SMTP optional)
```

The browser only ever talks to our backend. It never calls the Fake Store API.

Inside the backend, dependencies point one way:

```
http (routes, validation)  →  application (services, pure logic)  →  domain (types + interfaces)
                                                                          ▲
infrastructure (Fake Store client, SQLite, email senders) ───implements───┘
```

The three things expected to change each sit behind an interface in `Backend/src/domain/`:

| What may change | Interface | Today | To change it |
|---|---|---|---|
| Product data source | `ProductRepository` | Fake Store API | Add one class, pass it in `server.ts` |
| Enquiry storage | `EnquiryRepository` | SQLite | Add one class, for example Postgres |
| Email provider | `EmailSender` | Logs the email | Add one class, or set `EMAIL_PROVIDER=smtp` |

The front end keeps data access (`src/api`, `src/hooks`) apart from presentational components. All colours and spacing are CSS variables in `Frontend/src/styles/theme.css`, so the look can be replaced in one file.

More detail: [Backend/README.md](Backend/README.md), [Frontend/README.md](Frontend/README.md).

## API

| Method and path | Purpose |
|---|---|
| `GET /api/health` | Health check |
| `GET /api/products/featured` | Top 5 products by rating |
| `GET /api/categories` | Category names |
| `GET /api/products?search=&category=&page=&pageSize=` | Paged list, title search |
| `GET /api/categories/:category/products` | Top 4 rated, then the rest, paged |
| `GET /api/products/:id` | One product |
| `POST /api/enquiries` | Submit an enquiry |

Errors always look like `{"error":{"code":"...","message":"..."}}`.

## Email

Email providers cost money, so none is used by default. `EMAIL_PROVIDER=log` writes a short line to the backend log (enquiry id, subject, recipient, length) and sends nothing. The enquiry itself is always saved in the database first, so nothing is lost.

An SMTP sender is built and tested, and is switched on with `EMAIL_PROVIDER=smtp` plus the `SMTP_*` settings in `Backend/.env.example`. It has not been run against a real mail server.

## How it could be deployed on AWS

This is guidance only. Nothing is deployed, and no AWS code is included.

- **Images:** both Dockerfiles build as they are. Push them to **ECR**.
- **Web app:** build with `VITE_API_BASE_URL` set to the public API address, upload `dist/` to **S3** and serve it through **CloudFront**. Or run the nginx image on ECS.
- **API:** run the backend image on **ECS Fargate** (or App Runner) behind an **Application Load Balancer**, using `/api/health` as the health check. Set `TRUST_PROXY=true` there.
- **Database:** SQLite needs a persistent local disk and cannot be shared between instances, so move enquiries to **RDS (PostgreSQL)**. Write a `PostgresEnquiryRepository` implementing `EnquiryRepository`.
- **Email:** write an `SesEmailSender` implementing `EmailSender` and add it to `createEmailSender`. Verify the sender address in **SES**.
- **Retries:** a scheduled job (**EventBridge** plus **Lambda**) reads `findUnsent()` and re-sends enquiries stuck as pending or failed.
- **Configuration:** keep values in **Secrets Manager** or **SSM Parameter Store** and pass them as task environment variables.
- **Rate limiting:** today it is in memory per instance. Use **AWS WAF** rate rules or a shared store such as ElastiCache.
- **Observability:** the backend logs JSON to stdout, which ECS sends to **CloudWatch Logs**.
- **Delivery:** a GitHub Actions workflow that runs the tests, builds the images and deploys.

## Repository layout

```
Backend/    Node.js API (see Backend/README.md)
Frontend/   React app (see Frontend/README.md)
docker-compose.yml, .env.example
DECISIONS.md   assumptions, trade-offs, what is next
AI_USAGE.md    how AI tools were used
```

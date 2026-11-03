# Decisions and Assumptions

## Assumptions (where the acceptance criteria were unclear)

| Topic | Assumption |
|---|---|
| "5 products I have chosen as top rated" | Top 5 products by rating (rate, then number of ratings, then id). The brief says "chosen" but gives no way to choose, and Fake Store has ratings, so rating decides |
| Category page | The 4 highest-rated products in the category, then all the others below them, paged. The count is a constant |
| Search | Case-insensitive match on the **title** only, across all categories. An empty search does nothing and does not call the API |
| Paging | 10 products per page, loaded automatically as the visitor scrolls (infinite scroll) |
| Enquiry fields | Name, email, optional phone, message. The product id and title are stored with it |
| "The sales inbox will receive an email" | No paid email service is allowed, so the default sender writes the email to the log. An SMTP sender exists for a real inbox. See below |
| Enquiry is never lost | The enquiry is saved to the database before any email is attempted. If the email fails, the customer still sees "Thank you" and the row is marked failed |
| Currency and language | Prices in US dollars, English only. Fake Store gives no currency, so USD is a constant |
| Empty and failing data | Every list has an empty state and an error state with Retry. A failed API call never leaves a blank page |
| Anonymous use | No login, no accounts, no basket. The brief only asks to browse and enquire |
| Seeing the enquiries | The brief says the sales inbox receives an email, but no email service is allowed. So the owner can read every saved enquiry on a small admin page (`/admin`), protected by a shared `ADMIN_TOKEN` |
| Categories with few products | Fake Store has only 20 products (4 to 6 per category). A category with 4 or fewer products shows its "Top rated" products and no "More" section, because there are no additional ones |

## Requirements simplified or dropped

| What | Why |
|---|---|
| Real email delivery | Providers cost money and the reviewer must not need an account. Built and unit-tested with a mocked transport, but not run against a real mail server |
| Choosing the "top rated" products | The admin page only lists enquiries; it cannot pick featured products. Rating decides |
| Retry job for unsent enquiries | The data is kept and `findUnsent()` exists, but no job runs. Skipped to stay in the time-box |
| Deployment to AWS | Not asked for. Documented in the README only |
| User accounts, sign-in for customers, analytics | Out of scope for the proof of concept |
| Per-field server error messages in the form | The client validates the same rules first, so a server rejection is rare. It shows one general message |
| Browser (end-to-end) tests | Backend and front end are covered by unit, component and HTTP tests. No Playwright suite |
| Docker config tested on the build machine | Docker was not installed where this was built, so the compose setup was written carefully but first run by the owner |

## How the design supports growth beyond the proof of concept

- **Swappable data source.** All product data goes through the `ProductRepository` interface. Moving from Fake Store to a real catalogue is one new class. The routes, services and front end do not change.
- **Swappable storage and email.** `EnquiryRepository` and `EmailSender` work the same way. Moving to Postgres or SES does not touch the enquiry logic.
- **Clear boundaries.** The browser never calls the product source. The backend layers (`http`, `application`, `domain`, `infrastructure`) only depend inwards, so business rules can be tested with in-memory fakes.
- **Replaceable look and feel.** Colours, spacing and type are CSS variables in one file. Presentational components do not fetch data, so a redesign does not touch data code.
- **Safe to change.** 349 tests (177 backend, 172 frontend) cover the critical paths, including failure cases (upstream down, email failing, invalid input).
- **Deployable.** Both services are Docker images, configured only by environment variables.

## Security basics included

- Input validated on the server with zod and mirrored on the client, with a test that checks the email rules match on both sides.
- Email header injection blocked (line breaks and control characters rejected, subject and reply-to sanitised). The email is plain text, and user input is never rendered as HTML.
- All SQL uses parameters.
- Rate limit of 5 enquiries a minute per IP, a hidden honeypot field, and a request size limit.
- Security headers (helmet), CORS limited to one origin, no stack traces in responses, no secrets in the repository.
- Timeouts on the upstream product call, the SMTP connection and the browser's enquiry request, so a slow service cannot hang the page.

## Trade-offs worth knowing

- **Temporary admin token for development.** Outside production, with no `ADMIN_TOKEN` set, the admin token is the weak placeholder `123` (the server logs a warning). It is never used in production or in the Docker image, where an unset token means the admin page is disabled and a set token needs 16+ characters. It is one constant (`DEV_ADMIN_TOKEN`) to delete before any real use.
- **Admin access is one shared token.** No per-person login or audit trail, and it needs HTTPS in production. The next step is real sign-in (for example Cognito or company SSO on AWS).

- **`node:sqlite`** is built into Node 24 and needs no native build, but Node still marks it experimental. The interface makes it a one-file change to replace.
- **The honeypot field** is called `website`, which browsers can autofill. A real person whose browser fills it would see "Thank you" while the enquiry is silently dropped. The server logs a warning when this happens. A less autofill-prone name would be safer.
- **The rate limit** is in memory, per instance. Behind a load balancer it needs `TRUST_PROXY=true` and, at scale, a shared store.
- **Product cache.** The product list is cached for 5 minutes in memory, so the Fake Store API is called rarely. Ratings can be up to 5 minutes old.
- **If a sent email's status update fails,** a future retry job could send that one twice. The data is correct, and a duplicate email is the safer failure.

## What I would do next with another day

1. Run the Docker setup end to end on a clean machine and fix anything it shows.
2. Add the retry job for unsent enquiries.
3. Add a browser test (Playwright) for browse, search, enquire and the admin page.
4. Replace SQLite with Postgres, and the log email sender with SES, then deploy to a test AWS account.
5. Let the owner choose the featured products (a small admin setting) instead of ranking by rating.
6. Add accessibility checks to the tests and a pass with a screen reader.
   Replace the shared admin token with real sign-in and remove `DEV_ADMIN_TOKEN`.
7. Add server-side field errors to the form and an analytics event for submitted enquiries.

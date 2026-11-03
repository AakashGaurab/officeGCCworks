# Catalogue Frontend

React 18 + TypeScript (strict) + Vite single-page app for browsing the product catalogue. It only talks to
the catalogue Backend (`../Backend`), never to the Fake Store API.

## Install, run, test, build

```bash
npm install
cp .env.example .env   # optional, defaults work with the backend defaults
npm run dev            # http://localhost:5173 (port is fixed: the backend CORS default allows it)
npm test               # Vitest + React Testing Library, API fully mocked, no network
npm run lint
npm run typecheck
npm run build && npm run preview
```

Start the backend first (`npm run dev` in `../Backend`, port 3001).

## Environment

| Variable | Default | Meaning |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:3001/api` | Backend base URL including `/api` |

If you change the frontend port or host, update `CORS_ORIGIN` in the Backend to match.

## Routes

| Path | Page |
|---|---|
| `/` | Top rated products and category links |
| `/category/:category` | "Top rated in ..." then "More in ..." with infinite scroll |
| `/search?q=term` | Title search results with infinite scroll |
| `/products/:id` | Product details |
| `*` | Not found |

Category names such as `men's clothing` are encoded with `encodeURIComponent` when building links
(`utils/routePaths.ts`); React Router decodes them again in `useParams`.

## Folder structure

```
src/
  api/         apiClient (fetch + ApiError), catalogueApi and enquiryApi (one function per endpoint)
  types/       Product, Category, Paginated types matching the backend
  constants/   AppConstants (numbers), Routes (paths, params), Text (all UI strings as enums)
  hooks/       Data hooks: useFetch, useFeaturedProducts, useCategories, useProduct,
               useInfiniteProducts (generic paging), useCategoryProducts, useSearchProducts,
               useInfiniteScroll (IntersectionObserver sentinel), useEnquiryForm (field values and
               which errors to show), useSubmitEnquiry (idle/submitting/success/error)
  components/  Presentational building blocks (Layout, Header, SearchBar, ProductCard, ProductGrid,
               StarRating, ProductImage, LoadingState, EmptyState, ErrorState, ErrorBoundary,
               EnquirySection (container), EnquiryForm, EnquiryThanks, FormField, ...)
  pages/       One component per route; they only combine hooks and components
  utils/       Pure helpers (price formatting, route paths, ...)
  styles/      theme.css (design tokens) and base.css (global rules)
  test/        Test setup, fixtures, fake IntersectionObserver
```

Each component has its own `.css` file next to it, using only the variables from `theme.css`.

## How the standards are applied

- Naming: PascalCase components and files, camelCase variables/functions, kebab-case CSS classes,
  SCREAMING_SNAKE_CASE constants and enum members.
- No magic numbers: they live in `constants/AppConstants.ts` (e.g. `PAGE_SIZE`, `CURRENCY`).
- No hard-coded UI strings: they live in the enums in `constants/Text.ts`.
- No inline functions in JSX: handlers and render functions are named inside the component.
- Arrays and objects are declared outside components; logic lives in hooks and utils.
- Component order: imports, constants, hooks, state, refs, effects, handlers, render functions, return.
- Dependency inversion: components never call `fetch`; hooks import `api/catalogueApi`, which tests replace
  with `vi.mock`. `useInfiniteProducts` receives its page fetcher as a parameter.
- Race conditions: every request has an `AbortController`; answers from an outdated request are ignored.

## Changing the theme

Edit only `src/styles/theme.css`: colours, fonts, spacing, radius, shadow and the focus ring are CSS
variables used by every component stylesheet.

## Product enquiry flow

On `/products/:id` the **Enquire** button (`EnquirySection`) opens an inline form with the product title in
its heading (no modal).

1. Fields: name, email, phone (optional) and message. Validation (`utils/validateEnquiry.ts`) mirrors the
   backend rules. A field's error shows when the user leaves it, all errors show on submit, and focus moves
   to the first invalid field. Errors are linked with `aria-describedby` and `aria-invalid`.
2. A hidden `website` field (visually hidden, `aria-hidden`, not focusable) is a honeypot for bots. Real
   users never fill it; the backend then ignores the enquiry.
3. `useSubmitEnquiry` sends the data through `api/enquiryApi.ts`. While sending the button is disabled and
   reads "Sending...".
4. Success replaces the form with a "Thank you" message and a "Send another enquiry" button.
5. Failure (network, 400, 429, 5xx) shows a friendly message in `role="alert"`. The typed input is kept, so
   pressing "Send enquiry" again retries. Field errors from the server are shown as one general message.

The email itself is sent by the Backend; the customer is only told the enquiry was received.

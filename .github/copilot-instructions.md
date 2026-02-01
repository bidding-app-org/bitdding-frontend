# BidPulse Frontend - AI Coding Agent Guide

## Project Overview
BidPulse is a React + TypeScript auction/bidding system frontend. It's a Vite-based SPA that communicates with a Spring Boot backend (port 8080) to display products, manage bids, and handle seller operations.

**Key tech stack:**
- React 19 + React Router v6 for routing
- TypeScript 5.9 (strict mode)
- Vite for dev/build
- No state management library (useState/useEffect pattern)

## Architecture Patterns

### API Layer (`src/api/`)
- **Single responsibility:** Each module (products.ts, bids.ts) wraps backend endpoints
- **Error handling:** Custom `ApiError` class with status codes and parsed details
- **Client setup:** `client.ts` exports `apiFetch<T>()` for all requests; respects `VITE_API_BASE_URL` env var
- **Uploads:** Backend serves images at `/uploads/<filename>` via `uploadsUrl()` helper

Example API pattern:
```typescript
export async function createProduct(form: FormData): Promise<ProductResponse> {
  return apiFetch('/api/products', { method: 'POST', body: form })
}
```

### Page Components (`src/pages/`)
- **Pattern:** Manage local state with useState for UI, useEffect for data loading
- **Lifecycle:** Set `alive` flag in useEffect to prevent state updates on unmounted components
- **Real-time updates:** Pages use `useNow()` hook (internal) to track countdown timers
- **Error display:** Pages show toast messages (success/error) for user actions

Example pattern (from ProductDetailsPage):
```typescript
const [product, setProduct] = useState<ProductResponse | null>(null)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  let alive = true
  getProduct(id).then(p => { if (alive) setProduct(p) })
  return () => { alive = false }
}, [id])
```

### Routing (`AppRoutes.tsx`)
- **Layout wrapper:** All routes wrapped in `<Layout />` component (shared header/footer)
- **Routes:**
  - `/` → HomePage (lists all products)
  - `/products/:id` → ProductDetailsPage (bid interface)
  - `/seller` → SellerDashboardPage
  - `/seller/add` → AddProductPage
  - `/seller/products/:id/edit` → EditProductPage
  - `*` → NotFoundPage

## Type Definitions
Located in [src/types/api.ts](src/types/api.ts):
- `ProductResponse` — Product data with pricing, status (ACTIVE/SOLD), image filename
- `Bid` — Individual bid with amount, timestamp, bidder name
- `BidRequest` — Payload for placing a bid

**Key field convention:** Prices are strings (e.g., "99.99"), not numbers. Parse with `Number()` when needed.

## Developer Workflows

### Starting Dev Server
```bash
npm install
npm start  # or npm run dev
```
- App runs at `http://localhost:5173`
- Backend must be running at `http://localhost:8080` (or set `VITE_API_BASE_URL`)
- On Windows PowerShell errors, use `RUN_FRONTEND.cmd` (uses CMD instead)

### Build & TypeScript
```bash
npm run build  # Runs: tsc -b && vite build
npm run lint   # ESLint check
```
- TypeScript must pass before Vite builds (no type errors allowed)
- Output → `dist/` folder

### Environment Variables
- `VITE_API_BASE_URL` — Override backend URL (defaults to `http://localhost:8080`)

## Conventions & Patterns

### State Management
- **No Redux/Context API** — Use React hooks directly
- **Form handling:** FormData for multipart (product uploads), JSON for simple requests
- **Async cleanup:** Always set `alive = false` in useEffect cleanup to prevent memory leaks

### Error Handling
- API errors throw `ApiError` with `.status` and `.details` properties
- Components catch and display in toast (success/error/info kinds) or error state
- User-facing messages extracted from API response `message` field when available

### Date/Time Handling
- Utility functions in [src/utils/date.ts](src/utils/date.ts):
  - `parseLocalDateTime()` — Parses ISO string to Date
  - `formatCountdown()` — Displays time remaining on auctions
  - `formatMoney()` — Formats price strings with currency

### Styling
- Single CSS file per page/component (e.g., `App.css`, `index.css`)
- Class-based (no Tailwind/CSS-in-JS)
- Shared layout styles in `App.css`

## Communication Patterns

### With Backend
- **Base path:** `/api/products`, `/api/sellers`, `/api/sellers/{name}/products/`
- **FormData:** Used for product creation/update (includes image uploads)
- **Query params:** `?sellerName=` required for DELETE operations (seller authorization)
- **Status codes:** Rely on HTTP status; API error body has `message` field

### Component Communication
- **Props drilling:** Used for page-level data (no context)
- **URL params:** `useParams()` from React Router (e.g., `productId` in `/products/:id`)
- **Navigation:** `<Link>` for internal routes, `useNavigate()` for programmatic

## Key Files Reference
- [src/AppRoutes.tsx](src/AppRoutes.tsx) — Route definitions
- [src/api/client.ts](src/api/client.ts) — HTTP client, error handling, base URL config
- [src/api/products.ts](src/api/products.ts) & [src/api/bids.ts](src/api/bids.ts) — Endpoint wrappers
- [src/pages/ProductDetailsPage.tsx](src/pages/ProductDetailsPage.tsx) — Complex example with bids/countdown
- [src/components/Layout.tsx](src/components/Layout.tsx) — Shared navigation structure

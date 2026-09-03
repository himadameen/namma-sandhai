# நம்ம சந்தை | Namma Sandhai

**உழைப்புக்கு சரியான விலை.** — *The right price for every harvest.*

Tamil Nadu–first agricultural marketplace connecting farmers directly with verified buyers.

---

## Phase 11 Status ✅

- **Demo seed scenario**: Featured Krishnagiri Tomato listing (₹42/kg, 500 kg) for demo farmer
- **Demo data**: Pending incoming request, completed sale + sales record on farmer dashboard
- **Stable crop images** in seed (no broken Unsplash URLs)
- **UI polish**: Auth-aware navbar, dashboard header with logout, buyer mobile nav
- **Demo UX**: Demo accounts card on login, hackathon walkthrough on landing page
- **i18n**: Demo walkthrough strings in English + Tamil

### Quick demo (password: `Demo@2026`)

1. **Buyer** → Marketplace → Tomato (Krishnagiri) → Send request (200 kg, ₹42/kg)
2. **Farmer** → Requests → Accept → Orders → Confirm → In Transit → Completed
3. **Farmer** → Dashboard / Sales → Export CSV
4. **Admin** → Verify users, view platform stats

Re-seed after pulling: `cd backend && npm run db:seed`

---

## Phase 10 Status ✅

- **Admin APIs**: `GET /api/admin/dashboard`, farmers/buyers lists, verify/revoke endpoints
- **Platform KPIs**: users, listings, orders, sales volume, pending verifications
- **User management**: Verify or revoke farmer and buyer accounts with notifications
- **Frontend**: `/admin` panel with overview, farmers and buyers tabs

---

## Phase 9 Status ✅

- **Full i18n coverage**: All user-facing strings wired to `en.json` / `ta.json`
- **Status labels**: Listing, request and order statuses translated
- **Buyer types**, profile placeholders, auth form labels, aria labels
- **Tamil polish**: Replaced mixed English strings in Tamil locale

---

## Phase 8 Status ✅

- **Farmer dashboard**: `GET /api/farmers/dashboard` — KPIs, monthly sales chart, crop breakdown, recent sales
- **Buyer dashboard**: `GET /api/buyers/dashboard` — requests, orders, spend KPIs, recent orders
- **Sales records**: `GET /api/farmers/sales-records`, `GET /api/farmers/sales-records/export` (CSV)
- **Frontend**: `/farmer/dashboard`, `/farmer/sales`, `/buyer/dashboard` with Recharts

---

## Phase 7 Status ✅

- **Order APIs**: `GET /api/farmers/orders`, `GET /api/buyers/orders`, `PATCH .../orders/:id/status`
- **Status flow**: `PENDING_CONFIRMATION` → `CONFIRMED` → `IN_TRANSIT` → `COMPLETED` (or `CANCELLED`)
- **On complete**: Auto-creates `SalesRecord`, updates listing quantity, sends notifications
- **Frontend**: `/farmer/orders`, `/buyer/orders` with visual timeline and role-based actions

### Demo flow (steps 8–10)

1. After farmer accepts a request, open `/farmer/orders` → **Confirm Order**
2. **Mark In Transit** → buyer/farmer can **Mark Completed**
3. Completed order appears in sales records (Phase 8 dashboard)

---

## Phase 6 Status ✅

- **Buyer purchase requests**: `POST /api/buyers/purchase-requests`, `GET /api/buyers/purchase-requests`
- **Farmer request management**: `GET /api/farmers/purchase-requests`, accept / reject / counter
- **Order creation**: Accepting a request auto-creates an `Order` (`PENDING_CONFIRMATION`) + notifications
- **Frontend**: `/marketplace/:id` send-request dialog, `/buyer/requests`, `/farmer/requests` (accept/reject/counter UI)
- **i18n**: English + Tamil strings for purchase request flows

### Demo flow (steps 6–8)

1. Log in as **buyer** → open a listing → **Send Purchase Request** (qty, price, delivery)
2. Log in as **farmer** → `/farmer/requests` → **Accept** (or reject / counter)
3. Order is created on accept — full order timeline UI comes in **Phase 7**

---

## Phase 5 Status ✅

- **Farmer listings CRUD**: `GET/POST/PUT/DELETE /api/farmers/listings` (owner-only)
- **Marketplace**: `GET /api/listings` with search, crop, district, price, quantity filters
- **Listing detail**: `GET /api/listings/:id` with market average price
- **Frontend**: `/farmer/listings`, `/marketplace`, `/marketplace/:id`

---

## Phase 4 Status ✅

- **Crops API**: `GET /api/crops` — 15 Tamil Nadu crops
- **Market prices**: `GET /api/market-prices` — filter by crop, district, date range
- **Price trends**: `GET /api/market-prices/trend` — 7-day chart data, insight card, listing comparison
- **Frontend**: `/farmer/market-prices` — KPI cards, Recharts line chart, crop/district filters

---

## Phase 3 Status ✅

- **Farmer profile**: `GET/PUT /api/farmers/profile` — name, phone, district, farm size, crops, address, language
- **Buyer profile**: `GET/PUT /api/buyers/profile` — organization, buyer type, district, address, language
- **Frontend**: Editable profile pages at `/farmer/profile` and `/buyer/profile`, synced with auth user

---

## Phase 2 Status ✅

- **PostgreSQL + Prisma**: Full schema with 10 models, migrations applied
- **Seed data**: 15 farmers, 8 buyers, 15 crops, 50 market prices, 30 listings, orders, notifications
- **JWT auth**: Register, login, `/me` with bcrypt + role-based middleware
- **Frontend auth**: Login/register forms wired, protected routes, token persistence

### Demo Accounts

Password for all demo accounts: **`Demo@2026`**

| Email | Role |
|-------|------|
| `farmer@nammasandhai.demo` | Farmer (முருகன்) |
| `buyer@nammasandhai.demo` | Buyer (ABC Fresh Mart) |
| `admin@nammasandhai.demo` | Admin |

---

## Phase 1 Status ✅

This phase establishes the project foundation:

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui components
- **Design system**: Brand colors, Manrope + Noto Sans Tamil typography
- **Routing**: All application routes with placeholder pages
- **Landing page**: Polished hero, stats, how-it-works, feature sections
- **i18n scaffold**: English + Tamil translation files with language switcher
- **Backend skeleton**: Express + TypeScript with health check and error handling

> Business features (marketplace, listings, dashboards) come in Phase 3+.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, TypeScript, Tailwind CSS, shadcn/ui, React Router, TanStack Query, Recharts, React Hook Form, Zod, react-i18next |
| Backend | Node.js, Express, TypeScript, Prisma, JWT, bcrypt, Zod |
| Database | PostgreSQL + Prisma |

---

## Project Structure

```
namma-sandhai/
├── frontend/
│   └── src/
│       ├── api/           # API client
│       ├── components/    # UI + layout components
│       ├── hooks/         # Custom React hooks
│       ├── layouts/       # Page layouts
│       ├── locales/       # en.json, ta.json
│       ├── pages/         # Route pages
│       ├── routes/        # React Router config
│       ├── services/      # Business logic
│       ├── store/         # State management
│       ├── types/         # TypeScript types
│       └── utils/         # Helpers
├── backend/
│   └── src/
│       ├── config/        # Environment config
│       ├── controllers/   # Route controllers
│       ├── middleware/    # Express middleware
│       ├── routes/        # API routes
│       ├── services/      # Business logic
│       ├── utils/         # Helpers
│       └── validators/    # Zod schemas
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Environment Variables

**Frontend** (`frontend/.env`):

```env
VITE_API_URL=http://localhost:3001/api
```

**Backend** (`backend/.env`):

```env
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/namma_sandhai
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

Copy from `.env.example` files in each directory.

### Database Setup

Start PostgreSQL (Docker example):

```bash
docker run -d --name namma-sandhai-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=namma_sandhai -p 5433:5432 postgres:16-alpine
```

Then migrate and seed:

```bash
cd backend
npm run db:migrate
npm run db:seed
```

### Install & Run

**Backend:**

```bash
cd backend
npm install
npm run dev
```

API health check: `GET http://localhost:3001/api/health`

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`

### Build

```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend && npm run build
```

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page + demo walkthrough |
| `/login`, `/register` | Auth (JWT) + demo accounts |
| `/marketplace`, `/marketplace/:id` | Browse & listing detail |
| `/farmer/dashboard` | Farmer KPIs, charts, recent sales |
| `/farmer/listings` | Manage produce listings |
| `/farmer/market-prices` | Market price trends |
| `/farmer/requests` | Incoming purchase requests |
| `/farmer/orders` | Order timeline & status |
| `/farmer/sales` | Sales ledger + CSV export |
| `/farmer/profile` | Farmer profile |
| `/buyer/dashboard` | Buyer KPIs & recent orders |
| `/buyer/requests` | Outgoing purchase requests |
| `/buyer/orders` | Order tracking |
| `/buyer/profile` | Buyer profile |
| `/admin` | Admin panel (verify users, stats) |

---

## Design System

| Token | Value |
|-------|-------|
| Primary | `#164A35` |
| Secondary | `#3F8F5F` |
| Accent | `#D9A441` |
| Background | `#F7F6EF` |
| Text | `#183027` |

Fonts: **Manrope** (English), **Noto Sans Tamil** (Tamil)

---

## Roadmap (12 phases)

| Phase | Scope | Status |
|-------|--------|--------|
| 1 | Setup, design system, routing | ✅ |
| 2 | DB, Prisma, JWT auth, seed | ✅ |
| 3 | Farmer & buyer profiles | ✅ |
| 4 | Crops & market prices | ✅ |
| 5 | Listings & marketplace | ✅ |
| 6 | Purchase requests | ✅ |
| 7 | Orders (timeline, status updates) | ✅ |
| 8 | Dashboards & sales records | ✅ |
| 9 | Tamil / English (full coverage) | ✅ |
| 10 | Admin panel | ✅ |
| 11 | Polish & demo data | ✅ |
| 12 | Deployment | Next |

**1 phase remains** — Deployment (Phase 12).

---

## License

ISC

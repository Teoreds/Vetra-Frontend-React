# Frontend Guidelines — Order Management B2B Portal

## 1. Architectural Principles

### Feature-Based Architecture
The codebase follows a strict **feature-based** structure under `src/features/`. Each feature is self-contained:

```
features/<name>/
  api/          # API calls + query key factories
  components/   # Presentational and container components
  hooks/        # Custom hooks (data fetching, mutations, UI logic)
  types/        # TypeScript types re-exported from OpenAPI schema
  pages/        # Route-level container components
```

### Separation of Concerns
- **Container components** (pages): Fetch data, orchestrate state, handle user actions.
- **Presentational components**: Receive props, render UI, emit events. Zero data fetching.
- **Hooks**: Encapsulate TanStack Query calls, mutations, and derived logic.
- **API layer**: Thin wrappers around `openapi-fetch` calls. No business logic.

### Single Source of Truth
- **OpenAPI schema** generates all TypeScript types. Never duplicate or manually author API interfaces.
- **Server state** lives in TanStack Query. Never copy server data into Zustand.
- **UI state only** goes into Zustand (sidebar open/closed, modals, local preferences).

---

## 2. Development Rules

### API Communication
1. All HTTP calls go through `shared/api/client.ts` (openapi-fetch instance).
2. JWT tokens are injected via middleware — no manual `Authorization` headers.
3. Every feature exposes typed hooks: `use<Entity>List()`, `use<Entity>(id)`, `useCreate<Entity>()`, `useUpdate<Entity>()`, `useDelete<Entity>()`.
4. Query keys are centralized in `<feature>/api/<feature>.queries.ts`.
5. Mutations invalidate related queries on success.

### TypeScript
- Strict mode enabled (`"strict": true`).
- No `any`. Use `unknown` + type narrowing when needed.
- All API types are re-exported from `<feature>/types/` and originate from `shared/api/schema.d.ts`.

### Styling
- **Tailwind CSS only**. No CSS modules, no styled-components, no inline styles.
- Use `cva` (class-variance-authority) for component variants.
- Use `cn()` utility (clsx + tailwind-merge) for conditional classes.
- Reusable UI primitives live in `shared/ui/`.
- No global CSS overrides unless strictly necessary (e.g., font import).

### Forms
- React Hook Form + Zod schemas.
- Schemas reflect backend validation constraints.
- Types derived from OpenAPI models (not manually re-created).

### State Management
| What | Where |
|---|---|
| Server data (entities, lists) | TanStack Query |
| Auth tokens | Zustand (persisted) |
| UI state (modals, sidebar) | Zustand |
| Form state | React Hook Form |
| URL state (filters, pagination) | React Router search params or `useState` |

---

## 3. Anti-Patterns (DO NOT)

- **No manual `fetch()` or `axios` calls.** Always use the openapi-fetch client.
- **No server state in Zustand.** If it comes from the API, it belongs in TanStack Query.
- **No duplicated TypeScript interfaces.** All API types come from the generated schema.
- **No business logic in UI components.** Extract into hooks or utility functions.
- **No inline styles.** Use Tailwind classes exclusively.
- **No inventing order status transitions.** The state machine in `order-status.ts` is the single source of truth. UI actions must derive from it.
- **No prop drilling more than 2 levels deep.** Use composition or hooks instead.
- **No barrel exports (`index.ts`).** Import directly from the module path for tree-shaking clarity.

---

## 4. Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Directories | `kebab-case` | `order-rows/` |
| Component files | `kebab-case.tsx` | `orders-table.tsx` |
| Hook files | `kebab-case.ts` | `use-orders.ts` |
| Components | `PascalCase` | `OrdersTable` |
| Hooks | `camelCase` prefixed `use` | `useOrders` |
| Query keys | `<entity>Keys` object | `orderKeys.list(params)` |
| API wrappers | `<entity>Api` object | `ordersApi.list()` |
| Types | `PascalCase` suffixed with purpose | `OrderOut`, `OrderCreate` |
| Zustand stores | `use<Name>Store` | `useAuthStore` |

---

## 5. State Management Rules

### TanStack Query
- `staleTime: 30_000` (30s default). Override per-query when needed.
- `retry: 1` for queries, `0` for mutations.
- Cache invalidation happens in mutation `onSuccess` callbacks.
- Query keys are structured hierarchically (all → lists → list(params) → details → detail(id)).

### Zustand
- Only for **client-side UI state** (auth tokens, theme, sidebar toggle).
- Stores use `persist` middleware when state must survive page reload.
- Never store API responses in Zustand.

### Order Status State Machine
```
DRAFT → CONFIRMED → COMMITTED → PICKING → SHIPPED → COMPLETED
```
- Valid transitions are defined in `features/orders/types/order-status.ts`.
- The `StatusTransitionDropdown` component derives available actions from the current status.
- Invalid transitions are never shown to the user.

---

## 6. Folder Structure Reference

```
src/
├── app/                    # App bootstrap (App.tsx, router, providers)
├── config/                 # Environment variables, query client config
├── features/
│   ├── auth/               # Authentication (login, guards, token store)
│   ├── dashboard/          # Dashboard KPIs and overview
│   ├── orders/             # Full order lifecycle management
│   ├── parties/            # Customer/supplier/carrier management
│   ├── articles/           # Product catalog
│   └── warehouses/         # Warehouse management
├── layout/                 # App shell (sidebar, header, layouts)
└── shared/
    ├── api/                # OpenAPI client, generated schema
    ├── lib/                # Utility functions (cn, formatDate, formatCurrency)
    ├── types/              # Shared types (pagination)
    └── ui/                 # Reusable UI components (Button, DataTable, etc.)
```

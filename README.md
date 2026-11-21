# SecondHand MarketPlace (Parts Market)

A marketplace for secondhand car parts: a React + Vite frontend and a Node.js (Express) API backed by MongoDB Atlas.

Browse, part details, cart and the seller pages (My listings, Create/Edit listing, Inventory) read and write
the database, and sign-in uses JWT authentication. The remaining pages (orders, sold items, admin) still show mock data.

## Running the project

### Prerequisites
- [Node.js](https://nodejs.org/) **v20.19 or newer** (v22 LTS recommended). Check with `node -v`.
- npm (installed with Node.js).
- Access to the team's MongoDB Atlas cluster.

### 1. Backend (API)
```bash
cd Backend
npm install
cp .env.example .env   # then fill in MONGO_URI (never commit .env)
npm run dev            # http://localhost:5000
```

| Variable | Purpose |
|---|---|
| `MONGO_URI` | Atlas connection string |
| `DB_NAME` | Database name (default `marketplace`) |
| `PORT` | API port (default `5000`) |
| `CLIENT_ORIGIN` | Frontend origin allowed by CORS (default `http://localhost:5173`) |
| `JWT_SECRET` | **Required.** 32+ random characters used to sign tokens (the server refuses to start without it) |
| `JWT_EXPIRES_IN` | Token lifetime (default `1h`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | Only read by `npm run create-admin` |

Create the first administrator (registration never creates admins; an existing email is promoted and its password reset):
```bash
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='at-least-12-chars' npm run create-admin
```
Run the API tests (`npm test`, in `Backend/`): they use a throw-away `<DB_NAME>_test` database and drop it afterwards.

### 2. Frontend
In a second terminal:
```bash
cd Frontend
npm install
npm run dev            # http://localhost:5173
```
Set `VITE_API_URL` in `Frontend/.env` if the API is not on `http://localhost:5000` (see `Frontend/.env.example`).

## Exploring the app

### Signing in
Register at `/register`, then sign in with email and password. The API returns a JWT that the frontend sends as
`Authorization: Bearer <token>`. Accounts with role `admin` open the administrator portal. Seed accounts that
still hold placeholder password hashes cannot sign in until an admin sets a password
(`PATCH /api/admin/users/:id` with `{ "password": "..." }`) or `create-admin` is run for that email.

### Suggested walkthrough
1. **Browse parts** (`/browse`): search, filter and sort live listings from the database.
2. Open a part, add it to the **cart** (`/cart`) and change quantities.
3. Sign in as a seller and open **My listings**: search, filter by moderation status, delete with confirmation.
4. **Create listing**: submit empty to see validation, then submit a valid part. New listings start
   **In review** and only appear in Browse once approved (`status: "active"`).
5. **Edit** a listing: changing details sends it back to review; changing only the stock does not.
6. **Inventory**: update stock for several listings at once.
7. As a normal user, open an admin URL such as `/admin/users` to see **Access denied**.

### Page map
| Area | Routes |
|---|---|
| Public | `/browse`, `/parts/:id`, `/cart`, `/order-confirmation` (needs sign-in), `/access-denied` |
| Auth | `/login`, `/register`, `/forgot-password` |
| Account | `/account/overview`, `/listings`, `/listings/new`, `/listings/:id/edit`, `/inventory`, `/sold-items`, `/order-history`, `/personal-details`, `/security` |
| Admin | `/admin/users`, `/admin/moderation`, `/admin/audit-logs`, `/admin/security` |

## API

All responses are JSON. Errors use `{ "error": "message" }`, plus `details` (field -> message) for validation errors.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/meta` | Reference data: categories, conditions, statuses, currency, field limits |
| POST | `/api/auth/register` | Create a normal user (`name`, `email`, `password`, optional `accountType` buyer/seller) |
| POST | `/api/auth/login` | `{ email, password }` -> `{ token, user }` |
| GET / PATCH | `/api/auth/me` | Current account / change own `name` (nothing else) |
| GET | `/api/session` | Current account (same as `/api/auth/me`) |
| GET | `/api/admin/users`, `/api/admin/users/:id` | **Admin only.** View users |
| PATCH / DELETE | `/api/admin/users/:id` | **Admin only.** Change `name`, `role`, `accountType`, `status`, `password`; delete |
| GET | `/api/admin/listings?status=` | **Admin only.** All listings |
| PATCH / DELETE | `/api/admin/listings/:id` | **Admin only.** Edit, moderate (`status`) or delete any listing |
| GET | `/api/parts` | Active listings for Browse |
| GET | `/api/parts/:id` | One active listing |
| GET/POST/PATCH/DELETE | `/api/cart`, `/api/cart/items/:listingId` | Cart for the current browser |
| GET | `/api/seller/listings?search=&status=` | The caller's listings |
| GET | `/api/seller/listings/:id` | One of the caller's listings |
| POST | `/api/seller/listings` | Create a listing (starts `pending`) |
| PATCH | `/api/seller/listings/:id` | Update fields; anything but `quantity` re-submits for review |
| DELETE | `/api/seller/listings/:id` | Delete a listing and remove it from carts |

Seller endpoints require a valid JWT (`401` otherwise). `PATCH`/`DELETE` on a listing owned by someone else
return `403`; reading another seller's listing returns `404`. Non-admins get `403` on `/api/admin/*`.

### Authorization
- **Role** (`admin` | `user`) controls permissions; **account type** (`buyer` | `seller`) is separate. Older user
  records that stored the account type in `role` are read correctly without a migration.
- The token holds only the user id; role and status are loaded from MongoDB on every request, so promotions,
  demotions and suspensions take effect immediately. Roles are changed only through `PATCH /api/admin/users/:id`.
- Passwords are hashed with bcrypt and never returned. The cart endpoints still use their per-browser `X-User-Id` id.

### Input validation
- Request bodies are read through a field whitelist (`validators/listing.js`); fields like `status` or
  `sellerId` sent by a client are ignored.
- Every value must be a primitive of the expected type, so query operators such as `{ "$gt": "" }` are rejected
  (NoSQL injection).
- Prices are validated as strings with up to 3 decimals and stored as `Decimal128`.
- Search text is regex-escaped and length-limited.

## Project structure
```
Backend/
  config/         db connection, reference data (categories, statuses, limits)
  middleware/     currentUser (JWT -> req.user), authorize (roles, listing ownership)
  repositories/   MongoDB data access (users, seller listings)
  routes/         Express routers: meta, auth, admin, session, parts, cart, seller listings
  scripts/        create-admin
  tests/          API integration tests
  validators/     request validation
  utils/          shared listing helpers for the public catalogue
  server.js       app setup, error handling, startup indexes
Frontend/
  src/
    api/          API client and one module per resource (pages never call fetch directly)
    hooks/        useMeta (reference data)
    components/   shared layouts (DashboardLayout, PublicLayout)
    data/         sample parts data (kept for reference; pages load data from the API)
    pages/        auth/, account/, admin/, public/
    utils/        formatting helpers
    auth.js       client-side session helper
```

## Notes
- Orders are simulated and no payment is taken.
- Listing photos are not uploaded yet.

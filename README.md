# SecondHand MarketPlace (Parts Market)

A marketplace for secondhand car parts. This repository currently contains a **front-end skeleton**
(React + Vite) built from the Figma designs. It uses hardcoded mock data, so no backend or database is needed to run it.

## Running the front-end skeleton

### Prerequisites
- [Node.js](https://nodejs.org/) **v20.19 or newer** (v22 LTS recommended). Check with `node -v`.
- npm (installed with Node.js).

### Steps
1. Open a terminal in the project folder and go to the front-end folder:
   ```bash
   cd Frontend
   ```
2. Install dependencies (first time only):
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the URL printed in the terminal (normally **http://localhost:5173**) in your browser.

To stop the server, press `Ctrl + C` in the terminal.

Optional: `npm run build` creates a production build, and `npm run preview` serves it.

## Exploring the prototype

The app opens on **Register**. Every page is reachable by clicking links and buttons. There is no real
login, so use the rules below.

### Signing in (prototype rules)
Any email and password are accepted (the email must look valid and the password must not be empty).

| Sign in with | You get |
|---|---|
| Any email, e.g. `user@example.com` | Seller / buyer account (`/account/...`) |
| An email starting with `admin`, e.g. `admin@example.com` | Administrator portal (`/admin/...`) |

### Suggested walkthrough
1. **Browse parts** (`/browse`): search, filter (category, make, year, condition, stock, price) and sort. Filters apply as you change them.
2. Click **View details** on a part, then **Log in to order**.
3. **Create account** (`/register`): submit with invalid fields to see the validation errors; valid details go to the Sign in page with a success banner.
4. **Forgot password?** on the Sign in page: Send reset link, Check your inbox, then "Simulate clicking email link" to reach the new password form.
5. Sign in as a normal user, return to a part and **Place order** to see the order confirmation.
6. **My account**: Overview, My listings (Create / Edit listing), Inventory, Sold items, Order history, Personal details, Security (change or delete account).
7. Log out, sign in with an `admin...` email: User management (Overview), Listing moderation, Audit logs, Security.
8. As a normal user, open an admin URL such as `/admin/users` to see **Access denied**. Any unknown URL shows **Page not found**.

### Page map
| Area | Routes |
|---|---|
| Public | `/browse`, `/parts/:id`, `/order-confirmation` (needs sign-in), `/access-denied` |
| Auth | `/login`, `/register`, `/forgot-password` |
| Account | `/account/overview`, `/listings`, `/listings/new`, `/listings/:id/edit`, `/inventory`, `/sold-items`, `/order-history`, `/personal-details`, `/security` |
| Admin | `/admin/users`, `/admin/moderation`, `/admin/audit-logs`, `/admin/security` |

## Project structure
```
Frontend/
  src/
    components/   shared layouts (DashboardLayout, PublicLayout)
    pages/        auth/, account/, admin/, public/
    data/         hardcoded mock parts
    auth.js       fake sign-in helper (sessionStorage)
    index.css     global styles
Backend/          placeholder, not used by the skeleton
```

## Notes
- All data is static mock data; forms do not save anything.
- Orders are simulated and no payment is taken.

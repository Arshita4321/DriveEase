# DriveEase — Frontend

A modern, animated, fully responsive frontend for the DriveEase car & bike rental
platform. Built with **React 18 + Vite + Tailwind CSS + Framer Motion**, wired to
the existing DriveEase Node/Express/MongoDB API (`../backend`).

## Quick start

```bash
npm install
cp .env.example .env      # point VITE_BACKEND_URL at your API if not on :5000
npm run dev                # http://localhost:5173
```

The dev server proxies `/api/*` to `VITE_BACKEND_URL` (see `vite.config.js`), so
no CORS setup is needed locally. For production, set `VITE_API_URL` to your
deployed API's base URL and run `npm run build`.

## Design system

- **Palette** — deep indigo/purple primary (`#4338CA` → `#6D28D9`), cyan and
  orange accents, soft gradients, glassmorphism panels.
- **Type** — Sora (display), Inter (body), JetBrains Mono (numbers/data).
- **Signature motif** — an animated dashed "route line" (see
  `src/components/ui/RouteLine.jsx`) used across the hero, auth screens, and
  section dividers to tie the whole product back to the idea of a journey.
- **Dark mode** — class-based (`dark:`), toggled from the navbar, persisted to
  `localStorage`, and respects `prefers-color-scheme` on first visit.
- Accessible focus rings, `prefers-reduced-motion` support, and skeleton
  loaders throughout.

## Notable enhancements beyond the brief

- **⌘K command palette** (`src/components/CommandPalette.jsx`) — instant
  fuzzy search across vehicles and app navigation, keyboard-driven.
- **Live availability checking** on the booking calendar — calls
  `/vehicles/:id/availability` as soon as both dates are picked.
- **Real Razorpay checkout integration** in `PaymentPanel.jsx` (loads the
  Razorpay script, creates an order, opens the modal, verifies the signature),
  styled as a premium payment sheet with card/UPI tabs.
- **Animated, real-time admin analytics** (area/bar/pie charts via Recharts)
  driven by the actual `/admin/dashboard` aggregation endpoint.
- **Vehicle comparison tool** with a searchable picker and a side-by-side spec
  table.
- Toast notifications, optimistic UI updates, and smooth page transitions
  throughout via `framer-motion` + `react-hot-toast`.

## Folder structure

```
driveease-frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── src/
    ├── main.jsx                  # app entry, providers
    ├── App.jsx                   # routes, layout switch, command palette
    ├── index.css                 # design tokens / global styles
    ├── context/
    │   ├── AuthContext.jsx       # auth, wishlist state
    │   └── ThemeContext.jsx      # light/dark mode
    ├── services/
    │   └── api.js                # axios instance + auth interceptor
    ├── hooks/
    │   ├── useDebounce.js
    │   └── useCountUp.js         # animated stat counters
    ├── components/
    │   ├── ui/                   # design-system primitives
    │   │   ├── Button.jsx  Card.jsx  Input.jsx  Select.jsx  Badge.jsx
    │   │   ├── Modal.jsx  Skeleton.jsx  StatCard.jsx  Rating.jsx
    │   │   ├── EmptyState.jsx  RouteLine.jsx (signature motif)
    │   ├── layout/
    │   │   ├── Navbar.jsx  Footer.jsx  AuthShell.jsx  PageTransition.jsx
    │   ├── ProtectedRoute.jsx
    │   ├── NotificationBell.jsx
    │   ├── Chatbot.jsx            # floating expandable assistant
    │   ├── CommandPalette.jsx     # ⌘K search & navigate
    │   ├── VehicleCard.jsx
    │   ├── WishlistButton.jsx
    │   ├── BookingCalendar.jsx    # dates + live availability + pricing
    │   ├── PromoInput.jsx
    │   └── PaymentPanel.jsx       # Razorpay-styled checkout
    ├── pages/
    │   ├── Home.jsx               # landing: hero, search, featured, testimonials
    │   ├── Login.jsx  Signup.jsx  ForgotPassword.jsx  ResetPassword.jsx
    │   ├── VehicleList.jsx        # filters, sort, pagination, responsive grid
    │   ├── VehicleDetail.jsx      # gallery, specs, booking, reviews
    │   ├── MyBookings.jsx         # user dashboard: bookings
    │   ├── Profile.jsx            # user dashboard: profile + wishlist + stats
    │   ├── Compare.jsx            # side-by-side vehicle comparison
    │   └── NotFound.jsx
    └── admin/
        ├── AdminLayout.jsx        # collapsible sidebar shell
        ├── AdminDashboard.jsx     # stat cards + charts
        ├── AdminVehicles.jsx      # CRUD + image upload
        ├── AdminUsers.jsx         # block/unblock, edit
        ├── AdminBookings.jsx      # status management
        ├── AdminReviews.jsx       # moderation
        └── AdminPromos.jsx        # promo code CRUD
```

## Tech stack

React 18 · Vite 5 · Tailwind CSS 3 · Framer Motion · Recharts · React Router 6 ·
Axios · React Hot Toast · React Icons · React Datepicker · date-fns

## Backend contract

This frontend expects the DriveEase Express API included in the uploaded
project (`DriveEase/backend`), unmodified — routes, field names, and response
shapes (e.g. `{ vehicles, total, page, pages }`, `{ token, user }`,
`{ notifications, unreadCount }`) all match `src/services/api.js` calls
one-to-one. Point `VITE_BACKEND_URL` / `VITE_API_URL` at wherever that server
is running and everything (auth, bookings, payments, admin analytics) works
end-to-end.

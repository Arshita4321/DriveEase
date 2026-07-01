# DriveEase — Car & Bike Rental Platform

Full-stack rental application: **React (Vite) + Node.js/Express + MongoDB**, with JWT auth,
role-based access (user/admin), real-time availability checks, bookings, reviews, a rule-based
chatbot, an admin dashboard with charts, and optional Stripe payments + email notifications.

## Folder structure

```
DriveEase/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # signup, login, getMe
│   │   ├── vehicleController.js   # CRUD + search/filter + availability check
│   │   ├── bookingController.js   # create/cancel/list bookings, admin status updates
│   │   ├── reviewController.js    # add/list reviews, admin hide/delete
│   │   ├── adminController.js     # dashboard stats, user management
│   │   ├── chatbotController.js   # rule-based assistant
│   │   └── paymentController.js   # Stripe payment intent + confirm
│   ├── middleware/
│   │   ├── authMiddleware.js      # protect (JWT) + adminOnly
│   │   └── errorMiddleware.js     # notFound + centralized error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Vehicle.js
│   │   ├── Booking.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── vehicleRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── chatbotRoutes.js
│   │   └── paymentRoutes.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── email.js                # Nodemailer booking confirmation
│   │   └── seed.js                 # creates admin user + sample vehicles
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── admin/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AdminDashboard.jsx  # metrics + revenue/status charts (recharts)
│   │   │   ├── AdminVehicles.jsx   # add/edit/delete vehicles
│   │   │   ├── AdminUsers.jsx      # view/edit/block/unblock users
│   │   │   ├── AdminBookings.jsx   # approve/cancel/update booking status
│   │   │   └── AdminReviews.jsx    # hide/delete reviews
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Chatbot.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── VehicleList.jsx     # search + filters
│   │   │   ├── VehicleDetail.jsx   # booking + reviews
│   │   │   └── MyBookings.jsx
│   │   ├── services/
│   │   │   └── api.js              # Axios instance with JWT interceptor
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md (this file)
```

## Prerequisites

- Node.js 18+ and npm
- MongoDB running locally, or a MongoDB Atlas connection string

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env and set MONGO_URI, JWT_SECRET, etc.
```

Seed the database with an admin account and sample vehicles:

```bash
npm run seed
```

This creates:
- Admin login: `admin@driveease.com` / `Admin@123`
- 3 sample vehicles (cars + bike)

Run the backend (dev mode with auto-reload):

```bash
npm run dev
```

Or in production mode:

```bash
npm start
```

The API runs on `http://localhost:5000` by default. Health check: `GET /api/health`.

## 2. Frontend setup

In a separate terminal:

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api (already default)
npm run dev
```

The app runs on `http://localhost:5173` and proxies `/api` calls to the backend in dev mode.

Build for production:

```bash
npm run build
npm run preview
```

## 3. MongoDB quick start (if you don't have it running)

Using Docker:

```bash
docker run -d --name driveease-mongo -p 27017:27017 mongo:7
```

Or install MongoDB Community Edition locally and ensure `mongod` is running, matching the
`MONGO_URI` in `backend/.env` (default `mongodb://127.0.0.1:27017/driveease`).

## 4. Try it out

1. Visit `http://localhost:5173`
2. Sign up as a normal user, or log in as admin (`admin@driveease.com` / `Admin@123`)
3. Browse vehicles → filter/search → open a vehicle → pick dates → check availability → book
4. As admin, visit `/admin` for the dashboard, and manage vehicles/users/bookings/reviews
5. Click the chat bubble (bottom-right) to ask about pricing, availability, or booking steps

## Optional integrations

- **Stripe payments**: set `STRIPE_SECRET_KEY` in `backend/.env`. Endpoints are at
  `POST /api/payments/create-intent` and `POST /api/payments/confirm`. Wire up
  `@stripe/stripe-js` + Elements on the frontend booking flow to fully enable checkout UI.
- **Email notifications**: set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` in `backend/.env`.
  Call `sendBookingConfirmation()` from `backend/utils/email.js` inside the booking/payment
  confirmation flow (e.g. in `paymentController.confirmPayment` or after admin approval).

## Notes on architecture

- **Auth**: JWT issued on signup/login, verified via `protect` middleware; `adminOnly`
  middleware restricts admin routes.
- **Booking conflicts**: real-time overlap check at both `GET /vehicles/:id/availability`
  and booking creation time to prevent double-booking race conditions.
- **Admin dashboard metrics**: aggregated via MongoDB aggregation pipelines (revenue by month,
  bookings by status, available vs rented vehicle counts).
- **Chatbot**: simple rule-based intent matching in `chatbotController.js` — no external API
  key required. Swap in an LLM API call there if you want smarter responses.
- **Scalability**: stateless JWT auth, indexed Vehicle fields (`type`, `location`,
  `pricePerDay`), pagination on vehicle listing, modular routes/controllers/models for
  straightforward horizontal scaling and future microservice splitting.

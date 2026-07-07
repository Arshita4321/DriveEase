# DriveEase — Car & Bike Rental Platform

Full-stack rental application: **React (Vite) + Node.js/Express + MongoDB**, with JWT auth,
role-based access (user/admin), real-time availability checks, bookings, reviews, a rule-based
chatbot, an admin dashboard with charts, and optional Stripe payments + email notifications.


## Prerequisites

- Node.js 18+ and npm
- MongoDB running locally, or a MongoDB Atlas connection string

## 1. Backend setup

```bash
cd backend
npm install

# edit .env and set MONGO_URI, JWT_SECRET, etc.
```

Seed the database with an admin account and sample vehicles:

```bash
npm run seed
```

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

# VITE_API_URL=http://localhost:5000/api (already default)
npm run dev
```

The app runs on `http://localhost:5173` and proxies `/api` calls to the backend in dev mode.

Build for production:

```bash
npm run build
npm run preview
```
## 3. MongoDB quick start (using MongoDB Atlas cluster)

This project connects to a **MongoDB Atlas cluster** instead of a local MongoDB instance.

1. **Create a cluster** (if you don't have one):
   - Sign in at [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a free/shared cluster (or use an existing one)
   - Under **Database Access**, create a database user with a username and password
   - Under **Network Access**, add your current IP address (or `0.0.0.0/0` for testing/dev only)

2. **Get your connection string**:
   - Go to your cluster → **Connect** → **Drivers**
   - Copy the connection string, it will look like:

3. **Set the `MONGO_URI`** in `backend/.env`, including your database name:
```env
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/driveease?retryWrites=true&w=majority
```
   > Replace `<username>`, `<password>`, and `<cluster-name>` with your actual Atlas credentials. If your password contains special characters, make sure to [URL-encode](https://www.mongodb.com/docs/manual/reference/connection-string/#special-characters) them.

4. **Verify the connection** by starting the backend — a successful connection log confirms it's working:
```bash
   cd backend
   npm run dev
```

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

require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');
const connectDB   = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { startScheduler } = require('./utils/scheduler');

const authRoutes         = require('./routes/authRoutes');
const vehicleRoutes      = require('./routes/vehicleRoutes');
const bookingRoutes      = require('./routes/bookingRoutes');
const reviewRoutes       = require('./routes/reviewRoutes');
const adminRoutes        = require('./routes/adminRoutes');
const chatbotRoutes      = require('./routes/chatbotRoutes');
const paymentRoutes      = require('./routes/paymentRoutes');
const uploadRoutes       = require('./routes/uploadRoutes');
const userRoutes         = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const promoRoutes        = require('./routes/promoRoutes');

connectDB();
startScheduler();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'DriveEase API v2' }));

app.use('/api/auth',          authRoutes);
app.use('/api/vehicles',      vehicleRoutes);
app.use('/api/bookings',      bookingRoutes);
app.use('/api/reviews',       reviewRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/chatbot',       chatbotRoutes);
app.use('/api/payments',      paymentRoutes);
app.use('/api/upload',        uploadRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/promos',        promoRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`DriveEase API v2 running on port ${PORT}`));

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { config } from './common/config';
import { swaggerDocument } from './common/config/swagger';
import { errorHandler } from './common/middleware/error-handler';
import { sendError } from './common/utils/response';

// Route imports
import authRoutes from './auth/auth.routes';
import userRoutes from './users/user.routes';
import vendorRoutes from './vendors/vendor.routes';
import categoryRoutes from './categories/category.routes';
import listingRoutes from './listings/listing.routes';
import bookingRoutes from './bookings/booking.routes';
import paymentRoutes from './payments/payment.routes';
import reviewRoutes from './reviews/review.routes';
import wishlistRoutes from './wishlists/wishlist.routes';

const app = express();

// ─── Global Middleware ───────────────────────────────────
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
app.use(cookieParser());

// Body parsers — raw body needed for Razorpay webhook signature verification
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// ─── Swagger Docs ────────────────────────────────────────
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'GoTrip API Docs',
  swaggerOptions: { persistAuthorization: true },
}));

// ─── Health Check ────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ──────────────────────────────────────────
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/vendors`, vendorRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/listings`, listingRoutes);
app.use(`${API_PREFIX}/bookings`, bookingRoutes);
app.use(`${API_PREFIX}/payments`, paymentRoutes);
app.use(`${API_PREFIX}/reviews`, reviewRoutes);
app.use(`${API_PREFIX}/wishlists`, wishlistRoutes);

// ─── 404 Handler ─────────────────────────────────────────
app.use((_req, res) => {
  sendError(res, 'Route not found', 404);
});

// ─── Error Handler ───────────────────────────────────────
app.use(errorHandler);

export default app;

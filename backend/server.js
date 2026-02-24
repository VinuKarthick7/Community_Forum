require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit     = require('express-rate-limit');
const compression   = require('compression');
const morgan        = require('morgan');
const hpp           = require('hpp');
const connectDB = require('./config/db');

const authRoutes         = require('./routes/auth');
const categoryRoutes     = require('./routes/categories');
const postRoutes         = require('./routes/posts');
const commentRoutes      = require('./routes/comments');
const userRoutes         = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const { protect, isAdmin } = require('./middlewares/auth');
const Report = require('./models/Report');

const isProd = process.env.NODE_ENV === 'production';

connectDB();

const app = express();

// Trust reverse proxy (Render / Railway / Heroku)
app.set('trust proxy', 1);

// Gzip compression
app.use(compression());

// Security headers
app.use(helmet());

// HTTP request logging
app.use(morgan(isProd ? 'combined' : 'dev'));

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));

// Body parser — 10 kb limit prevents large-payload attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Prevent HTTP parameter pollution (e.g. ?sort=asc&sort=desc)
app.use(hpp());

// Sanitize req.body / req.query against NoSQL injection
app.use(mongoSanitize());

// ── Rate limiters ──────────────────────────────────────────────
// Auth endpoints: 20 req / 15 min / IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: 'Too many attempts, please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/auth/login',               authLimiter);
app.use('/api/auth/register',            authLimiter);
app.use('/api/auth/resend-verification', authLimiter);

// General API: 100 req / 15 min / IP
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: 'Too many requests, please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', apiLimiter);

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/categories',    categoryRoutes);
app.use('/api/posts',         postRoutes);
app.use('/api/comments',      commentRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/notifications', notificationRoutes);

// Admin: get all reports
app.get('/api/admin/reports', protect, isAdmin, async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 }).limit(100)
            .populate('reporter', 'name email');
        res.json(reports);
    } catch { res.status(500).json({ message: 'Error fetching reports' }); }
});

// Health check
app.get('/', (req, res) => res.json({
    status: 'ok',
    message: 'IPS Tech Forum API running',
    env: process.env.NODE_ENV || 'development',
}));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler — never expose stack in production
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
        message: isProd ? 'Something went wrong' : err.message,
    });
});

// ── Start server ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
    console.log(`[${process.env.NODE_ENV || 'development'}] Server running on port ${PORT}`)
);

// Graceful shutdown — closes DB and in-flight requests cleanly
const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
    });
    // Force exit if still hanging after 10s
    setTimeout(() => process.exit(1), 10000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

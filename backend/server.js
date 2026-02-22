require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const { protect, isAdmin } = require('./middlewares/auth');
const Report = require('./models/Report');

connectDB();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Admin: get all reports
app.get('/api/admin/reports', protect, isAdmin, async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 }).limit(100)
            .populate('reporter', 'name email');
        res.json(reports);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// Health check
app.get('/', (req, res) => res.json({ message: 'IPS Tech Forum API running' }));

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(res.statusCode === 200 ? 500 : res.statusCode).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

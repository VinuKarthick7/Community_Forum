// One-time migration: mark all existing users as verified
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

(async () => {
    await connectDB();
    const result = await User.updateMany(
        { isVerified: { $exists: false } },
        { $set: { isVerified: true, verificationToken: null, verificationExpires: null } }
    );
    console.log(`Updated ${result.modifiedCount} existing users to verified`);
    process.exit(0);
})();

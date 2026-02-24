const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// @desc  Register new user (sends verification email)
// @route POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ message: 'Please fill all fields' });

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already registered' });

        // Generate verification token (valid 24 h)
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const user = await User.create({
            name, email, password,
            verificationToken,
            verificationExpires,
        });

        // Send verification email
        const verifyUrl = `${FRONTEND_URL}/verify-email/${verificationToken}`;
        await sendEmail({
            to: email,
            subject: 'Verify your IPS Forum account',
            html: `
                <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:2rem;border:1px solid #e5e7eb;border-radius:12px;">
                    <h2 style="color:#2563eb;margin-bottom:0.25rem;">Welcome to IPS Forum, ${user.name}!</h2>
                    <p style="color:#4b5563;">Click the button below to verify your email address. This link expires in 24 hours.</p>
                    <a href="${verifyUrl}" style="display:inline-block;padding:0.75rem 1.5rem;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin:1rem 0;">
                        Verify Email
                    </a>
                    <p style="color:#9ca3af;font-size:0.85rem;">If the button doesn't work, copy and paste this link:<br/><a href="${verifyUrl}" style="color:#2563eb;word-break:break-all;">${verifyUrl}</a></p>
                </div>
            `,
        });

        res.status(201).json({ message: 'Registration successful! Please check your email to verify your account.' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
};

// @desc  Verify email address
// @route GET /api/auth/verify/:token
const verifyEmail = async (req, res) => {
    try {
        const user = await User.findOne({
            verificationToken: req.params.token,
            verificationExpires: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired verification link' });

        user.isVerified = true;
        user.verificationToken = null;
        user.verificationExpires = null;
        await user.save();

        res.json({ message: 'Email verified successfully! You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying email' });
    }
};

// @desc  Resend verification email
// @route POST /api/auth/resend-verification
const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const user = await User.findOne({ email });
        // Generic message to prevent email enumeration
        if (!user || user.isVerified) return res.status(200).json({ message: 'If that email exists and is unverified, a new link has been sent.' });

        // Generate new token
        user.verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        const verifyUrl = `${FRONTEND_URL}/verify-email/${user.verificationToken}`;
        await sendEmail({
            to: email,
            subject: 'Verify your IPS Forum account',
            html: `
                <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:2rem;border:1px solid #e5e7eb;border-radius:12px;">
                    <h2 style="color:#2563eb;margin-bottom:0.25rem;">Hi ${user.name}!</h2>
                    <p style="color:#4b5563;">Click the button below to verify your email address. This link expires in 24 hours.</p>
                    <a href="${verifyUrl}" style="display:inline-block;padding:0.75rem 1.5rem;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin:1rem 0;">
                        Verify Email
                    </a>
                    <p style="color:#9ca3af;font-size:0.85rem;">If the button doesn't work, copy and paste this link:<br/><a href="${verifyUrl}" style="color:#2563eb;word-break:break-all;">${verifyUrl}</a></p>
                </div>
            `,
        });

        res.json({ message: 'Verification email sent! Check your inbox.' });
    } catch (error) {
        res.status(500).json({ message: 'Error resending verification email' });
    }
};

// @desc  Login user
// @route POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password)))
            return res.status(401).json({ message: 'Invalid email or password' });

        if (!user.isVerified) {
            return res.status(403).json({
                message: 'Please verify your email before logging in',
                needsVerification: true,
                email: user.email,
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            bio: user.bio,
            bookmarks: user.bookmarks,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in' });
    }
};

// @desc  Get current user profile
// @route GET /api/auth/me  (protected)
const getMe = async (req, res) => {
    res.json(req.user);
};

module.exports = { register, login, getMe, verifyEmail, resendVerification };

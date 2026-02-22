const User = require('../models/User');
const Post = require('../models/Post');

// @desc  Get public user profile
// @route GET /api/users/:id
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('name role bio createdAt');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
};

// @desc  Get a user's posts + stats
// @route GET /api/users/:id/posts
const getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ author: req.params.id })
            .populate('author', 'name')
            .populate('category', 'name')
            .sort({ createdAt: -1 });

        const totalUpvotes  = posts.reduce((sum, p) => sum + (p.upvotes?.length  || 0), 0);
        const totalComments = posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0);

        res.json({ posts, totalUpvotes, totalComments });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user posts', error: error.message });
    }
};

// @desc  Toggle bookmark on a post
// @route POST /api/users/bookmarks/:postId  (protected)
const toggleBookmark = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const postId = req.params.postId;
        const idx = user.bookmarks.findIndex((id) => id.toString() === postId);
        if (idx === -1) {
            user.bookmarks.push(postId);
        } else {
            user.bookmarks.splice(idx, 1);
        }
        await user.save();
        res.json({ bookmarked: idx === -1, bookmarks: user.bookmarks });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling bookmark', error: error.message });
    }
};

// @desc  Get authenticated user's bookmarks
// @route GET /api/users/bookmarks  (protected)
const getBookmarks = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'bookmarks',
            populate: [
                { path: 'author',   select: 'name' },
                { path: 'category', select: 'name' },
            ],
        });
        res.json(user.bookmarks.reverse()); // most recently bookmarked first
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookmarks', error: error.message });
    }
};

// @desc  Update own profile (bio)
// @route PUT /api/users/profile  (protected)
const updateProfile = async (req, res) => {
    try {
        const { bio, name } = req.body;
        const user = await User.findById(req.user._id);
        if (bio  !== undefined) user.bio  = bio.slice(0, 300);
        if (name !== undefined && name.trim()) user.name = name.trim();
        await user.save();
        res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, bio: user.bio });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};

// @desc  Change password
// @route PUT /api/users/password  (protected)
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword)
            return res.status(400).json({ message: 'Both current and new password are required' });
        if (newPassword.length < 6)
            return res.status(400).json({ message: 'New password must be at least 6 characters' });

        const user = await User.findById(req.user._id);
        const match = await user.matchPassword(currentPassword);
        if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

        user.password = newPassword; // pre-save hook will hash it
        await user.save();
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error changing password', error: error.message });
    }
};

module.exports = { getUser, getUserPosts, toggleBookmark, getBookmarks, updateProfile, changePassword };

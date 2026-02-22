const express = require('express');
const router = express.Router();
const { getUser, getUserPosts, toggleBookmark, getBookmarks, updateProfile, changePassword } = require('../controllers/userController');
const { protect } = require('../middlewares/auth');

// Protected personal routes (must come before /:id to avoid conflicts)
router.get(   '/bookmarks',          protect, getBookmarks);
router.post(  '/bookmarks/:postId',  protect, toggleBookmark);
router.put(   '/profile',            protect, updateProfile);
router.put(   '/password',           protect, changePassword);

// Public routes
router.get('/:id',       getUser);
router.get('/:id/posts', getUserPosts);

module.exports = router;

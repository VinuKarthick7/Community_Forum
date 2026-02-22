const express = require('express');
const router = express.Router();
const {
    getPosts, getMyPosts, getPost, createPost, updatePost, deletePost, upvotePost, pinPost, solvePost,
} = require('../controllers/postController');
const { protect, isAdmin } = require('../middlewares/auth');

router.get('/', getPosts);
router.get('/mine', protect, getMyPosts);   // must be before /:id
router.get('/:id', getPost);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/upvote', protect, upvotePost);
router.post('/:id/pin',    protect, isAdmin, pinPost);
router.post('/:id/solve/:commentId', protect, solvePost);

module.exports = router;

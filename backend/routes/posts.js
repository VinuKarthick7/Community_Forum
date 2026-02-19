const express = require('express');
const router = express.Router();
const {
    getPosts, getPost, createPost, updatePost, deletePost, upvotePost,
} = require('../controllers/postController');
const { protect } = require('../middlewares/auth');

router.get('/', getPosts);
router.get('/:id', getPost);
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/upvote', protect, upvotePost);

module.exports = router;

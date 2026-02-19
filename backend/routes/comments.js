const express = require('express');
const router = express.Router();
const { addComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middlewares/auth');

router.post('/', protect, addComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;

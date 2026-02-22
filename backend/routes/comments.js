const express = require('express');
const router = express.Router();
const { addComment, deleteComment, upvoteComment, reportContent } = require('../controllers/commentController');
const { protect } = require('../middlewares/auth');

router.post('/',           protect, addComment);
router.delete('/:id',      protect, deleteComment);
router.post('/:id/upvote', protect, upvoteComment);
router.post('/report',     protect, reportContent);   // body: { targetType, targetId, reason }

module.exports = router;

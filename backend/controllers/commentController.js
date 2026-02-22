const Comment = require('../models/Comment');
const Post    = require('../models/Post');
const Report  = require('../models/Report');
const { createNotification } = require('./notificationController');

// @desc  Add comment to a post
// @route POST /api/comments
const addComment = async (req, res) => {
    try {
        const { postId, content, parentComment } = req.body;
        if (!postId || !content)
            return res.status(400).json({ message: 'Post ID and content are required' });

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = await Comment.create({
            post: postId,
            author: req.user._id,
            content,
            parentComment: parentComment || null,
        });

        post.comments.push(comment._id);
        await post.save();

        const populated = await comment.populate('author', 'name email');

        // Trigger notifications
        if (parentComment) {
            const parent = await Comment.findById(parentComment).select('author');
            if (parent) {
                await createNotification({
                    recipient: parent.author,
                    sender: req.user._id,
                    type: 'reply',
                    post: postId,
                    comment: comment._id,
                });
            }
        } else {
            await createNotification({
                recipient: post.author,
                sender: req.user._id,
                type: 'comment',
                post: postId,
                comment: comment._id,
            });
        }

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
};

// @desc  Delete a comment (author or admin)
// @route DELETE /api/comments/:id
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const isOwner = comment.author.toString() === req.user._id.toString();
        if (!isOwner && req.user.role !== 'admin')
            return res.status(403).json({ message: 'Not authorized' });

        await Post.findByIdAndUpdate(comment.post, { $pull: { comments: comment._id } });
        await comment.deleteOne();
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting comment', error: error.message });
    }
};

// @desc  Toggle upvote on a comment
// @route POST /api/comments/:id/upvote
const upvoteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const idx = comment.upvotes.indexOf(req.user._id);
        const upvoted = idx === -1;
        if (upvoted) {
            comment.upvotes.push(req.user._id);
        } else {
            comment.upvotes.splice(idx, 1);
        }
        await comment.save();
        res.json({ upvotes: comment.upvotes.length, upvoted });
    } catch (error) {
        res.status(500).json({ message: 'Error upvoting comment', error: error.message });
    }
};

// @desc  Report a post or comment
// @route POST /api/comments/report
const reportContent = async (req, res) => {
    try {
        const { targetType, targetId, reason } = req.body;
        if (!targetType || !targetId || !reason)
            return res.status(400).json({ message: 'targetType, targetId, and reason required' });

        const existing = await Report.findOne({ reporter: req.user._id, targetType, targetId });
        if (existing) return res.status(400).json({ message: 'You already reported this' });

        const report = await Report.create({
            reporter: req.user._id,
            targetType,
            targetId,
            reason,
        });
        res.status(201).json({ message: 'Report submitted', report });
    } catch (error) {
        res.status(500).json({ message: 'Error reporting content', error: error.message });
    }
};

module.exports = { addComment, deleteComment, upvoteComment, reportContent };

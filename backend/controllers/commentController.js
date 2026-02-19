const Comment = require('../models/Comment');
const Post = require('../models/Post');

// @desc  Add comment to a post
// @route POST /api/comments
const addComment = async (req, res) => {
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
    res.status(201).json(populated);
};

// @desc  Delete a comment (author or admin)
// @route DELETE /api/comments/:id
const deleteComment = async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const isOwner = comment.author.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin')
        return res.status(403).json({ message: 'Not authorized' });

    // Remove from parent post's comments array
    await Post.findByIdAndUpdate(comment.post, { $pull: { comments: comment._id } });
    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
};

module.exports = { addComment, deleteComment };

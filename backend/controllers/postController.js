const mongoose = require('mongoose');
const Post    = require('../models/Post');
const Comment = require('../models/Comment');
const Report  = require('../models/Report');
const { createNotification } = require('./notificationController');

// @desc  Get all posts (with search, filter, sort, pagination)
// @route GET /api/posts?search=&category=&tag=&author=&page=&limit=&sort=newest|top|hot
const getPosts = async (req, res) => {
    try {
        const { search, category, tag, author, page = 1, limit = 10, sort = 'newest' } = req.query;

        const matchStage = {};
        if (search) matchStage.$text = { $search: search };
        if (category) {
            try { matchStage.category = new mongoose.Types.ObjectId(category); } catch {}
        }
        if (tag) matchStage.tags = tag.toLowerCase();
        if (author) {
            try { matchStage.author = new mongoose.Types.ObjectId(author); } catch {}
        }

        const sortStage =
            sort === 'top'  ? { pinned: -1, upvoteCount: -1 } :
            sort === 'hot'  ? { pinned: -1, commentCount: -1 } :
                              { pinned: -1, createdAt: -1 };

        const pipeline = [
            { $match: matchStage },
            { $addFields: {
                upvoteCount:  { $size: '$upvotes'  },
                commentCount: { $size: '$comments' },
                pinned:       { $ifNull: ['$pinned', false] },
            }},
            { $sort: sortStage },
            { $facet: {
                metadata: [{ $count: 'total' }],
                data: [
                    { $skip: (Number(page) - 1) * Number(limit) },
                    { $limit: Number(limit) },
                    { $lookup: { from: 'users',       localField: 'author',   foreignField: '_id', as: 'authorArr'   }},
                    { $lookup: { from: 'categories',  localField: 'category', foreignField: '_id', as: 'categoryArr' }},
                    { $addFields: {
                        author:   { $ifNull: [{ $arrayElemAt: ['$authorArr',   0] }, null] },
                        category: { $ifNull: [{ $arrayElemAt: ['$categoryArr', 0] }, null] },
                    }},
                    { $project: { authorArr: 0, categoryArr: 0, 'author.password': 0 }},
                ],
            }},
        ];

        const [result] = await Post.aggregate(pipeline);
        const total = result.metadata[0]?.total || 0;
        res.json({ posts: result.data, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
};

// @desc  Get posts by the authenticated user
// @route GET /api/posts/mine  (protected)
const getMyPosts = async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user._id })
            .populate('author', 'name email')
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching your posts', error: error.message });
    }
};

// @desc  Get single post (increments view count)
// @route GET /api/posts/:id
const getPost = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        )
            .populate('author', 'name email role')
            .populate('category', 'name')
            .populate({
                path: 'comments',
                populate: { path: 'author', select: 'name email' },
            })
            .populate('acceptedAnswer');

        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching post', error: error.message });
    }
};

// @desc  Create post
// @route POST /api/posts
const createPost = async (req, res) => {
    try {
        const { title, content, category, tags } = req.body;
        if (!title || !content || !category)
            return res.status(400).json({ message: 'Title, content and category are required' });

        const post = await Post.create({
            title,
            content,
            category,
            tags: tags ? tags.map((t) => t.toLowerCase().trim()) : [],
            author: req.user._id,
        });

        const populated = await post.populate('author', 'name email');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: 'Error creating post', error: error.message });
    }
};

// @desc  Update post (author or admin)
// @route PUT /api/posts/:id
const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const isOwner = post.author.toString() === req.user._id.toString();
        if (!isOwner && req.user.role !== 'admin')
            return res.status(403).json({ message: 'Not authorized' });

        const { title, content, category, tags } = req.body;
        post.title = title || post.title;
        post.content = content || post.content;
        post.category = category || post.category;
        post.tags = tags ? tags.map((t) => t.toLowerCase().trim()) : post.tags;

        const updated = await post.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error updating post', error: error.message });
    }
};

// @desc  Delete post (author or admin)
// @route DELETE /api/posts/:id
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const isOwner = post.author.toString() === req.user._id.toString();
        if (!isOwner && req.user.role !== 'admin')
            return res.status(403).json({ message: 'Not authorized' });

        // Remove associated comments
        await Comment.deleteMany({ post: post._id });
        await post.deleteOne();
        res.json({ message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post', error: error.message });
    }
};

// @desc  Toggle upvote on a post
// @route POST /api/posts/:id/upvote
const upvotePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const userId = req.user._id.toString();
        const hasUpvoted = post.upvotes.map((id) => id.toString()).includes(userId);

        if (hasUpvoted) {
            post.upvotes = post.upvotes.filter((id) => id.toString() !== userId);
        } else {
            post.upvotes.push(req.user._id);
            await createNotification({
                recipient: post.author,
                sender: req.user._id,
                type: 'upvote',
                post: post._id,
            });
        }

        await post.save();
        res.json({ upvotes: post.upvotes.length, upvoted: !hasUpvoted });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling upvote', error: error.message });
    }
};

// @desc  Report a post
// @route POST /api/posts/:id/report
const reportPost = async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) return res.status(400).json({ message: 'Reason is required' });

        const existing = await Report.findOne({ reporter: req.user._id, targetType: 'post', targetId: req.params.id });
        if (existing) return res.status(400).json({ message: 'You already reported this post' });

        const report = await Report.create({
            reporter: req.user._id,
            targetType: 'post',
            targetId: req.params.id,
            reason,
        });
        res.status(201).json({ message: 'Report submitted', report });
    } catch (error) {
        res.status(500).json({ message: 'Error reporting post', error: error.message });
    }
};

// @desc  Toggle pin on a post (admin only)
// @route POST /api/posts/:id/pin
const pinPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        post.pinned = !post.pinned;
        await post.save();
        res.json({ pinned: post.pinned });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling pin', error: error.message });
    }
};

// @desc  Mark a comment as accepted answer (post author only)
// @route POST /api/posts/:id/solve/:commentId
const solvePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const isOwner = post.author.toString() === req.user._id.toString();
        if (!isOwner) return res.status(403).json({ message: 'Only the post author can mark a solution' });

        // Toggle: if already the same answer, un-solve it
        const isSame = post.acceptedAnswer?.toString() === req.params.commentId;
        post.solved         = !isSame;
        post.acceptedAnswer = isSame ? null : req.params.commentId;
        await post.save();
        res.json({ solved: post.solved, acceptedAnswer: post.acceptedAnswer });
    } catch (error) {
        res.status(500).json({ message: 'Error marking solution', error: error.message });
    }
};

module.exports = { getPosts, getMyPosts, getPost, createPost, updatePost, deletePost, upvotePost, reportPost, pinPost, solvePost };

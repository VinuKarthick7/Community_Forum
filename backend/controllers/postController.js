const Post = require('../models/Post');
const Comment = require('../models/Comment');

// @desc  Get all posts (with search, filter, pagination)
// @route GET /api/posts?search=&category=&tag=&page=&limit=
const getPosts = async (req, res) => {
    try {
        const { search, category, tag, page = 1, limit = 10 } = req.query;
        const query = {};

        if (search) query.$text = { $search: search };
        if (category) query.category = category;
        if (tag) query.tags = tag.toLowerCase();

        const total = await Post.countDocuments(query);
        const posts = await Post.find(query)
            .populate('author', 'name email')
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({ posts, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
};

// @desc  Get single post
// @route GET /api/posts/:id
const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'name email role')
            .populate('category', 'name')
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'name email',
                },
            });

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
        }

        await post.save();
        res.json({ upvotes: post.upvotes.length, upvoted: !hasUpvoted });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling upvote', error: error.message });
    }
};

module.exports = { getPosts, getPost, createPost, updatePost, deletePost, upvotePost };

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
        tags: [{ type: String, trim: true, lowercase: true }],
        upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
        views:          { type: Number, default: 0 },
        pinned:         { type: Boolean, default: false },
        solved:         { type: Boolean, default: false },
        acceptedAnswer: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    },
    { timestamps: true }
);

// Full-text search index
postSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Post', postSchema);

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        type:      { type: String, enum: ['comment', 'reply', 'upvote', 'accepted'], required: true },
        post:      { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
        comment:   { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
        read:      { type: Boolean, default: false },
    },
    { timestamps: true }
);

// index for fast unread queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

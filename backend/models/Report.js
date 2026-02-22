const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
    {
        reporter:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        targetType: { type: String, enum: ['post', 'comment'], required: true },
        targetId:   { type: mongoose.Schema.Types.ObjectId, required: true },
        reason:     { type: String, required: true, maxlength: 500 },
        resolved:   { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);

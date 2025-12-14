const mongoose = require('mongoose');

const CachedResponseSchema = new mongoose.Schema({
    question: String,
    answer: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CachedResponse', CachedResponseSchema);
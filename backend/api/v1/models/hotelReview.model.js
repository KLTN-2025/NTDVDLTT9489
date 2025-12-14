const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    hotel_id: String,
    room_id: String,
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1, max: 5
    },
    comment: String
}, {
    timestamps: true
});
const Review = mongoose.model("Review", reviewSchema, "reviews");

module.exports = Review;
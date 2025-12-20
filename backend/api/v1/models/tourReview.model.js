const mongoose = require('mongoose');

const tourReviewSchema = new mongoose.Schema({
    tour_id: {
        type: String,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1, 
        max: 5
    },
    comment: String
}, {
    timestamps: true
});

const TourReview = mongoose.model("TourReview", tourReviewSchema, "tour_reviews");

module.exports = TourReview;

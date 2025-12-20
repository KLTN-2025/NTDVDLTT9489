const mongoose = require("mongoose");
const Tour = require("../../models/tour.model");
const TourReview = require("../../models/tourReview.model");

// [POST]/api/v1/tour-reviews/:tourId
module.exports.review = async (req, res) => {
    try {
        const { tourId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;
        
        const tour = await Tour.findById(tourId);

        if (!tour) {
            return res.json({
                code: 400,
                message: "Tour không tồn tại"
            });
        }

        const existingReview = await TourReview.findOne({
            tour_id: tourId,
            user_id: userId
        });

        if (existingReview) {
            return res.json({
                code: 400,
                message: "Bạn đã đánh giá tour này rồi"
            });
        }

        const review = await TourReview.create({
            tour_id: tourId,
            user_id: userId,
            rating: parseInt(rating),
            comment: comment
        });
        
        return res.json({
            code: 200,
            message: "Đánh giá tour thành công",
            review: review
        });
    } catch (error) {
        return res.json({
            code: 500,
            message: "Error: " + error
        });
    }
};

// [GET]/api/v1/tour-reviews/get/:tourId
module.exports.getReviews = async (req, res) => {
    try {
        const { tourId } = req.params;
        
        const tour = await Tour.findById(tourId);
        
        if (!tour) {
            return res.json({
                code: 400,
                message: "Tour không tồn tại"
            });
        }
        
        const reviews = await TourReview.find({
            tour_id: tourId
        }).populate("user_id", "fullName avatar");

        return res.json({
            code: 200,
            message: "Lấy danh sách đánh giá thành công",
            reviews: reviews
        });
    } catch (error) {
        return res.json({
            code: 500,
            message: "Error: " + error
        });
    }
}

// [DELETE]/api/v1/tour-reviews/delete/:id
module.exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const review = await TourReview.findById(id);

        if (!review) {
            return res.json({
                code: 400,
                message: "Đánh giá không tồn tại"
            });
        }

        if (review.user_id.toString() !== userId.toString()) {
            return res.json({
                code: 403,
                message: "Bạn không có quyền xóa đánh giá này"
            });
        }

        await TourReview.findByIdAndDelete(id);

        return res.json({
            code: 200,
            message: "Xóa đánh giá thành công"
        });
    } catch (error) {
        return res.json({
            code: 500,
            message: "Error: " + error
        });
    }
};

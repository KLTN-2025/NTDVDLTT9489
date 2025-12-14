const mongoose = require("mongoose");
const Hotel = require("../../models/hotel.model");
const Room = require("../../models/room.model");
const Review = require("../../models/hotelReview.model");

// [POST]/api/v1/reviews/:hotelId/:roomId
module.exports.review = async (req, res) => {
    try {
        const { hotelId, roomId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;
        const hotel = await Hotel.findById(hotelId);
        const room = await Room.findById(roomId);

        if (!hotel || !room) {
            return res.json({
                code: 400,
                message: "Hotel or Room not found"
            });
        }

        if (room.hotel_id.toString() !== hotel._id.toString()) {
            return res.json({
                code: 400,
                message: "Phòng không thuộc khách sạn này"
            });
        }

        const existingReview = await Review.findOne({
            hotel_id: hotelId,
            room_id: roomId,
            user_id: userId
        });

        if (existingReview) {
            return res.json({
                code: 400,
                message: "Bạn đã đánh giá phòng này rồi"
            });
        }


        const review = await Review.create({
            hotel_id: hotelId,
            room_id: roomId,
            user_id: userId,
            rating: parseInt(rating),
            comment: comment
        });
        return res.json({
            code: 200,
            message: "Review thành công",
            review: review
        });
    } catch (error) {
        return res.json({
            code: 500,
            message: "Error" + error
        });
    }
};

// [GET]/api/v1/reviews/:hotelId/:roomId
module.exports.getReviews = async (req, res) => {
    try {
        const { hotelId, roomId } = req.params;
        const hotel = await Hotel.findById(hotelId);
        const room = await Room.findById(roomId);
        if (!hotel || !room) {
            return res.json({
                code: 400,
                message: "Hotel or Room not found"
            });
        }
        if (room.hotel_id.toString() !== hotel._id.toString()) {
            return res.json({
                code: 400,
                message: "Phòng không thuộc khách sạn này"
            });
        }
        const reviews = await Review.find({
            hotel_id: hotelId,
            room_id: roomId
        }).populate("user_id", "fullName avatar");

        return res.json({
            code: 200,
            message: "Lấy danh sách đánh giá thành công",
            reviews: reviews
        });
    } catch (error) {
        return res.json({
            code: 500,
            message: "Error" + error
        });
    }
}

// [DELETE]/api/v1/reviews/delete/:id
module.exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user._id;

        const data = await Review.deleteOne({
            _id: id,
            user_id: userId
        });

        if (data.deletedCount === 0) {
            return res.json({
                code: 404,
                message: "Xóa review thất bại!"
            });
        }

        return res.json({
            code: 200,
            message: "Xóa review thành công!"
        });
    } catch (error) {
        return res.json({
            code: 500,
            message: "Error" + error
        });
    }
}
const paginationHelper = require("../../helper/pagination");
const TourReview = require("../../models/tourReview.model");
const Tour = require("../../models/tour.model");

// [GET]/api/v1/admin/tour-reviews/:tourId
module.exports.indexTour = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("review_view")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền xem danh sách review"
        });
    } else {
        const tourId = req.params.tourId;
        let find = {
            tour_id: tourId
        };

        // Search
        if (req.query.search) {
            const normalizedSearch = req.query.search
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
            const searchRegex = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            const normalizedRegex = new RegExp(normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            find.$or = [
                { comment: { $regex: searchRegex } },
                { comment: { $regex: normalizedRegex } }
            ];
        }

        // sort
        const sort = {};
        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey] = req.query.sortValue;
        }

        // pagination
        const countRecords = await TourReview.countDocuments(find);
        let objPagination = paginationHelper(
            {
                currentPage: 1,
                limitItems: 10
            },
            req.query,
            countRecords
        );
        // end pagination

        const reviews = await TourReview.find(find).sort(sort).limit(objPagination.limitItems).skip(objPagination.skip);
        
        // Populate tour information
        const reviewsWithDetails = await Promise.all(reviews.map(async (review) => {
            const tour = await Tour.findById(review.tour_id);
            return {
                ...review.toObject(),
                tour_info: tour ? { title: tour.title, code: tour.code, _id: tour._id } : null
            };
        }));

        res.json({
            reviews: reviewsWithDetails,
            totalRecords: countRecords,
            totalPage: objPagination.totalPage
        });
    }
};

// [DELETE]/api/v1/admin/tour-reviews/delete/:id
module.exports.deleteTour = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("review_delete")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền xóa danh sách review"
        });
    } else {
        const id = req.params.id;

        await TourReview.deleteOne({
            _id: id
        });

        res.json({
            code: 200,
            message: "Đã xóa review thành công"
        });
    }
};

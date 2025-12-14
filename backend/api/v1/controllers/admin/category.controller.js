const Category = require("../../models/category.model");
const paginationHelper = require("../../helper/pagination");
const { convertToSlug } = require("../../helper/convertToSlug");

// [GET]/api/v1/admin/categories
module.exports.index = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("category_view")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền xem danh sách danh mục tour"
        });
    } else {
        let find = { deleted: false };

        // Search
        if (req.query.search) {
            const keywordRegex = new RegExp(req.query.search, "i");

            const stringSlug = convertToSlug(req.query.search);
            const stringSlugRegex = new RegExp(stringSlug, "i");
            find.$or = [
                { title: keywordRegex },
                { slug: stringSlugRegex }
            ];
        }

        if (req.query.status) {
            find.status = req.query.status;
        };

        // sort
        const sort = {};
        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey] = req.query.sortValue;
        }

        // pagination
        const countRecords = await Category.countDocuments(find);
        let objPagination = paginationHelper(
            {
                currentPage: 1,
                limitItems: 10
            },
            req.query,
            countRecords
        );
        // end pagination

        const categories = await Category.find(find).sort(sort).limit(objPagination.limitItems).skip(objPagination.skip);

        res.json({
            categories: categories,
            totalPage: objPagination.totalPage
        });
    }
};

// [POST]/api/v1/admin/categories/create
module.exports.create = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("category_create")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền tạo danh mục tour"
        });
    } else {
        try {
            const category = new Category({
                title: req.body.title,
                image: req.body.image,
                description: req.body.description,
                status: req.body.status,
            });
            const data = await category.save();
            res.json({
                code: 200,
                message: "Tạo thành công",
                data: data
            });
        } catch (error) {
            res.json({
                code: 404,
                message: "Không tồn tại!"
            });
        }
    }
};

// [PATCH]/api/v1/admin/categories/changeStatus/:status/:id
module.exports.changeStatus = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("category_edit")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền chỉnh sửa trạng thái danh mục tour"
        });
    } else {
        try {
            const status = req.params.status;
            const id = req.params.id;
            await Category.updateOne({
                _id: id
            }, {
                status: status
            });
            res.json({
                code: 200,
                message: "Cập nhật trạng thái danh mục thành công",
            });
        } catch (error) {
            res.json({
                code: 404,
                message: "Không tồn tại!"
            });
        }
    }
};

// [PATCH]/api/v1/admin/categories/edit/:id
module.exports.edit = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("category_edit")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền chỉnh sửa danh mục tour"
        });
    } else {
        try {
            const id = req.params.id;
            await Category.updateOne({
                _id: id,
                deleted: false
            }, req.body);
            res.json({
                code: 200,
                message: "Cập nhật danh mục thành công",
            });
        } catch (error) {
            res.json({
                code: 404,
                message: "Không tồn tại!"
            });
        }
    }
};

// [GET]/api/v1/admin/categories/detail/:id
module.exports.detail = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("category_view")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền xem chi tiết danh mục tour"
        });
    } else {
        try {
            const id = req.params.id;
            const data = await Category.findOne({
                _id: id,
                deleted: false
            });
            res.json({
                code: 200,
                message: "Thành công",
                data: data
            });
        } catch (error) {
            res.json({
                code: 404,
                message: "Không tồn tại!"
            });
        }
    }
};

// [DELETE]/api/v1/admin/categories/delete/:id
module.exports.delete = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("category_delete")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền xóa danh mục tour"
        });
    } else {
        try {
            const id = req.params.id;
            await Category.deleteOne({
                _id: id
            });
            res.json({
                code: 200,
                message: "Xóa thành công",
            });
        } catch (error) {
            res.json({
                code: 404,
                message: "Không tồn tại!"
            });
        }
    }
};
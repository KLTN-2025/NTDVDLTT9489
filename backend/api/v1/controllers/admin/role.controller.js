const Role = require("../../models/role.model");
const paginationHelper = require("../../helper/pagination");

// [GET]/api/v1/admin/roles
module.exports.index = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("role_view")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền xem danh sách nhóm quyền"
        });
    } else {
        let find = { deleted: false };

        if (req.query.status) {
            find.status = req.query.status;
        };

        // sort
        const sort = {};
        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey] = req.query.sortValue;
        }

        // pagination
        const countRecords = await Role.countDocuments(find);
        let objPagination = paginationHelper(
            {
                currentPage: 1,
                limitItems: 10
            },
            req.query,
            countRecords
        );
        // end pagination

        const roles = await Role.find(find).sort(sort).limit(objPagination.limitItems).skip(objPagination.skip);

        res.json({
            roles: roles,
            totalPage: objPagination.totalPage
        });
    }
};

// [POST]/api/v1/admin/roles/create
module.exports.createPost = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("role_create")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền tạo mới nhóm quyền"
        });
    } else {
        try {
            const role = new Role(req.body);
            const data = await role.save();
            res.json({
                code: 200,
                message: "Tạo nhóm quyền thành công",
                data: data
            });
        } catch (error) {
            res.json({
                code: 404,
                message: "Không tồn tại!" + error
            });
        }
    }
};

// [PATCH]/api/v1/admin/roles/edit/:id
module.exports.edit = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("role_edit")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền chỉnh sửa nhóm quyền"
        });
    } else {
        try {
            const id = req.params.id;
            await Role.updateOne({
                _id: id
            },
                req.body
            )
            res.json({
                code: 200,
                message: "Cập nhật nhóm quyền thành công"
            });
        } catch (error) {
            res.json({
                code: 404,
                message: "Không tồn tại!" + error
            });
        }
    }
};

// [GET]/api/v1/admin/roles/detail/:id
module.exports.detail = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("role_view")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền xem chi tiết nhóm quyền"
        });
    } else {
        try {
            const id = req.params.id;
            const data = await Role.findOne({
                _id: id
            });
            res.json(data);
        } catch (error) {
            res.json({
                code: 404,
                message: "Không tồn tại!" + error
            });
        }
    }
};

//[Patch] /api/v1/admin/roles/permissions
module.exports.permissionsPatch = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("role_permissions")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền phân quyền"
        });
    } else {
        try {
            const permissions = req.body.permissions;

            for (const item of permissions) {
                await Role.updateOne({ _id: item.id }, { permissions: item.permissions });
            }

            res.json({
                code: 200,
                message: "Cập nhật phân quyền thành công"
            })
        } catch (error) {
            res.json({
                code: 404,
                message: "Lỗi! " + error
            })
        }
    }
}

// [DELETE]/api/v1/admin/roles/delete/:id
module.exports.delete = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("role_delete")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền xóa nhóm quyền"
        });
    } else {
        try {
            const id = req.params.id;
            await Role.deleteOne({
                _id: id
            });
            res.json({
                code: 200,
                message: "Xóa nhóm quyền thành công"
            });
        } catch (error) {
            res.json({
                code: 404,
                message: "Không tồn tại!" + error
            });
        }
    }
};
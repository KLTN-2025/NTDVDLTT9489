const Account = require("../../models/account.model");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const generate = require("../../helper/generate");
const paginationHelper = require("../../helper/pagination");

// [GET]/api/v1/admin/accounts
module.exports.index = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("account_view")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền xem danh sách account"
        });
    } else {
        let find = { deleted: false };

        // Search
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            find.$or = [
                { fullName: searchRegex }
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
        const countRecords = await Account.countDocuments(find);
        let objPagination = paginationHelper(
            {
                currentPage: 1,
                limitItems: 10
            },
            req.query,
            countRecords
        );
        // end pagination

        const accounts = await Account.find(find).sort(sort).limit(objPagination.limitItems).skip(objPagination.skip).select("-password");

        res.json({
            accounts: accounts,
            totalPage: objPagination.totalPage
        });
    }
};

// [POST]/api/v1/admin/accounts/create
module.exports.createPost = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("account_create")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền tạo tài khoản"
        });
    } else {
        try {
            const emailExist = await Account.findOne({
                email: req.body.email,
                deleted: false
            });
            if (emailExist) {
                return res.json({
                    code: 400,
                    message: "Email đã tồn tại"
                })
            }

            const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

            const account = new Account({
                fullName: req.body.fullName,
                email: req.body.email,
                password: hashedPassword,
                token: generate.generateRandomString(20),
                phone: req.body.phone,
                avatar: req.body.avatar,
                role_id: req.body.role_id,
                status: req.body.status,
            });
            const data = await account.save();
            res.json({
                code: 200,
                message: "Tạo thành công",
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

// [POST]/api/v1/admin/accounts/login
module.exports.login = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const account = await Account.findOne({
        email: email,
        deleted: false
    });

    if (!account) {
        res.json({
            code: 400,
            message: "Email không tồn tại"
        });
        return;
    }
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
        res.json({
            code: 400,
            message: "Sai mật khẩu!"
        });
        return;
    }

    const token = account.token;
    res.cookie("tokenAccount", token);

    res.json({
        code: 200,
        message: "Đăng nhập thành công",
        token: token,
    });
};

// [GET]/api/v1/admin/accounts/detail
module.exports.detail = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("account_view")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền xem chi tiết tài khoản"
        });
    } else {
        const id = req.params.id;
        const account = await Account.findOne({
            _id: id,
            deleted: false
        }).select("-password");
        res.json(account);
    }
};

// [GET]/api/v1/admin/accounts/logout
module.exports.logout = async (req, res) => {
    res.clearCookie("tokenAccount");
    res.json({
        code: 200,
        message: "Đăng xuất thành công"
    });
}

// [PATCH]/api/v1/admin/accounts/edit/:id
module.exports.edit = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("account_edit")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền chỉnh sửa tài khoản"
        });
    } else {
        const id = req.params.id;

        const emailExists = await Account.findOne({
            _id: { $ne: id },
            email: req.body.email,
            deleted: false
        });

        if (emailExists) {
            return res.jso({
                code: 400,
                message: "Email đã tồn tại"
            });
        } else {
            if (req.body.password) {
                const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
                req.body.password = hashedPassword;
            } else {
                delete req.body.password;
            }

            await Account.updateOne({
                _id: id
            }, req.body);

            res.json({
                code: 200,
                message: "Cập nhật tài khoản thành công"
            })
        }
    }
}

// [PATCH]/api/v1/admin/accounts/changeStatus/:status/:id
module.exports.changeStatus = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("account_edit")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền chỉnh sửa trạng thái tài khoản"
        });
    } else {
        const status = req.params.status;
        const id = req.params.id;

        await Account.updateOne({
            _id: id
        }, {
            status: status
        });

        res.json({
            code: 200,
            message: "Cập nhật trạng thái tài khoản thành công"
        });
    }
}

// [DELETE]/api/v1/admin/accounts/delete/:id
module.exports.delete = async (req, res) => {
    const permissions = req.roles.permissions;
    if (!permissions.includes("account_delete")) {
        return res.json({
            code: 400,
            message: "Bạn không có quyền xóa tài khoản"
        });
    } else {
        try {
            const id = req.params.id;

            await Account.deleteOne({
                _id: id
            });

            res.json({
                code: 200,
                message: "Xóa tài khoản thành công"
            });
        } catch (error) {
            res.json({
                code: 404,
                message: "Không tồn tại!"
            });
        }
    }
}
const Account = require("../../models/account.model");
const Role = require("../../models/role.model");
module.exports.requireAuth = async (req, res, next) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        const account = await Account.findOne({
            token: token,
            deleted: false
        }).select("-password");
        if (!account) {
            res.json({
                code: 400,
                message: 'Token không hợp lệ'
            });
            return;
        }
        const role = await Role.findOne({
            _id: account.role_id,
            deleted: false
        });
        req.roles = role;
        req.account = account;
        next();
    } else {
        res.json({
            code: 400,
            message: 'Vui lòng gửi kèm token'
        });
    }
}
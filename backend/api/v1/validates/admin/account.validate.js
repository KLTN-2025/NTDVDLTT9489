module.exports.createAccount = (req, res, next) => {
    const errors = [];
    if (!req.body.fullName) {
        errors.push('Vui lòng nhập họ tên!');
    }
    if (!req.body.email) {
        errors.push('Vui lòng nhập email!');
    }
    if (!req.body.password) {
        errors.push('Vui lòng nhập mật khẩu!');
    }

    if (!req.body.confirmPassword) {
        errors.push('Vui lòng xác nhận lại mật khẩu!');
    }

    if (!req.body.role_id) {
        errors.push('Vui lòng nhập nhóm quyền!');
    }

    if (req.body.password != req.body.confirmPassword) {
        errors.push('Xác nhận mật khẩu không trùng khớp');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors: errors
        });
    }
    next();
}

module.exports.loginPost = (req, res, next) => {
    const errors = [];
    if (!req.body.email) {
        errors.push('Vui lòng nhập email!');
    }
    if (!req.body.password) {
        errors.push('Vui lòng nhập mật khẩu!');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors: errors
        });
    }
    next();
}
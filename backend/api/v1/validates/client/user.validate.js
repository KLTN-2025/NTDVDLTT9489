module.exports.registerPost = (req, res, next) => {
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

    if (req.body.password != req.body.confirmPassword) {
        errors.push('Xác nhận mật khẩu không trùng khớp');
    }

    if (req.body.password.length < 6) {
        errors.push('Mật khẩu phải có ít nhất 6 ký tự!');
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


module.exports.forgotPassword = (req, res, next) => {
    const error = [];
    if (!req.body.email) {
        error.push('Vui lòng nhập email!');
    }

    if (error.length > 0) {
        return res.status(400).json({
            success: false,
            error: error
        });
    }
    next();
}

module.exports.resetPasswordPost = (req, res, next) => {
    const errors = [];
    if (!req.body.password) {
        errors.push("Vui lòng nhập mật khẩu!")
    }

    if (!req.body.confirmPassword) {
        errors.push("Vui lòng nhập xác nhận mật khẩu!")
    }

    if (req.body.password != req.body.confirmPassword) {
        errors.push("Xác nhận mật khẩu không trùng khớp!")
    }

    if (req.body.password.length < 6) {
        errors.push("Mật khẩu phải có ít nhất 6 ký tự!");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors: errors
        });
    }
    next();
}


module.exports.changePassword = (req, res, next) => {
    const errors = [];
    if (!req.body.password) {
        errors.push("Vui lòng nhập mật khẩu!")
    }

    if (!req.body.newPassword) {
        errors.push("Vui lòng nhập mật khẩu mới!")
    }

    if (!req.body.confirmNewPassword) {
        errors.push("Vui lòng nhập xác nhận mật khẩu!")
    }

    if (req.body.newPassword.length < 6) {
        errors.push("Mật khẩu mới phải có ít nhất 6 ký tự!");
    }

    if (req.body.newPassword !== req.body.confirmNewPassword) {
        errors.push("Vui lòng nhập mật khẩu mới không trùng khớp!")
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors: errors
        });
    }
    next();
}

module.exports.edit = (req, res, next) => {
    const errors = [];
    if (req.body.email) {
        errors.push('Không được chỉnh sửa email!');
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors: errors
        });
    }
    next();
}
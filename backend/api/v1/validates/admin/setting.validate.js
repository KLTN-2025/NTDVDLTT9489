module.exports.settingValidate = (req, res, next) => {
    const errors = [];
    if (!req.body.websiteName) {
        errors.push('Vui lòng nhập tên website!');
    }
    if (!req.body.logo) {
        errors.push('Vui lòng nhập logo!');
    }
    if (!req.body.phone) {
        errors.push('Vui lòng nhập số điện thoại!');
    }
    if (!req.body.email) {
        errors.push('Vui lòng nhập email!');
    }
    if (!req.body.address) {
        errors.push('Vui lòng nhập địa chỉ!');
    }
    if (!req.body.slogan) {
        errors.push('Vui lòng nhập câu slogan!');
    }
    if (!req.body.copyright) {
        errors.push('Vui lòng nhập copyright!');
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors: errors
        });
    }
    next();
}
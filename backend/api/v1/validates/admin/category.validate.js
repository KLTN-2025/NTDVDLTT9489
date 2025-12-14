module.exports.categoryValidate = (req, res, next) => {
    const errors = [];
    if (!req.body.title) {
        errors.push('Vui lòng nhập tiêu đề!');
    }
    if (!req.body.description) {
        errors.push('Vui lòng nhập mô tả!');
    }
    if (!req.body.status) {
        errors.push('Vui lòng chọn status!');
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors: errors
        });
    }
    next();
}
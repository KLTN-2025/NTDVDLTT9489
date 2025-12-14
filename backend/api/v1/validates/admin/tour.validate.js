module.exports.tourValidate = (req, res, next) => {
    const errors = [];
    if (!req.body.title) {
        errors.push('Vui lòng nhập tiêu đề!');
    }
    if (!req.body.category_id) {
        errors.push('Vui lòng chọn danh mục!');
    }
    if (parseInt(req.body.price) <= 0) {
        errors.push('Vui lòng nhập giá lớn hơn 0!');
    }
    if (parseInt(req.body.discount) <= 0) {
        errors.push('Vui lòng nhập % giảm giá lớn hơn 0!');
    }
    if (!req.body.timeStarts) {
        errors.push("Vui lòng cung cấp ít nhất một thời gian khởi hành!");
    }
    if (!req.body.schedule) {
        errors.push('Vui lòng nhập lịch trình tour!');
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
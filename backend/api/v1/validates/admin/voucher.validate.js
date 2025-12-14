module.exports.voucherValidate = (req, res, next) => {
    const errors = [];
    if (!req.body.title) {
        errors.push('Vui lòng nhập tiêu đề!');
    }
    if (!req.body.description) {
        errors.push('Vui lòng nhập mô tả!');
    }
    if (!req.body.code) {
        errors.push('Vui lòng mã code!');
    }
    if (parseInt(req.body.quantity) <= 0) {
        errors.push('Số lượng phải lớn hơn 0!');
    }
    if (parseInt(req.body.discount) <= 0) {
        errors.push('Giảm giá phải lớn hơn 0!');
    }
    if (new Date(req.body.endDate).getTime() < Date.now()) {
        errors.push('Ngày kết thúc phải lớn hơn ngày hiện tại!');
    }
    if (new Date(req.body.startDate).getTime() >= new Date(req.body.endDate).getTime()) {
        errors.push('Ngày bắt đầu phải nhỏ hơn ngày kết thúc!');
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors: errors
        });
    }
    next();
}

module.exports.editVoucher = (req, res, next) => {
    const errors = [];
    if (req.body.endDate) {
        if (new Date(req.body.endDate).getTime() < Date.now()) {
            errors.push('Ngày kết thúc phải lớn hơn ngày hiện tại!');
        }
    }
    if (req.body.startDate) {
        if (new Date(req.body.startDate).getTime() >= new Date(req.body.endDate).getTime()) {
            errors.push('Ngày bắt đầu phải nhỏ hơn ngày kết thúc!');
        }
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors: errors
        });
    }
    next();
}
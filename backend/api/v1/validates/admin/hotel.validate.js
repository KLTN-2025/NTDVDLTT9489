module.exports.hotelValidate = (req, res, next) => {
    const errors = [];
    if (!req.body.name) {
        errors.push('Vui lòng nhập tên khách sạn!');
    }
    if (!req.body.location || !req.body.location.city) {
        errors.push('Vui lòng nhập thành phố!');
    }
    if (!req.body.location || !req.body.location.country) {
        errors.push('Vui lòng nhập đất nước!');
    }
    if (!req.body.location || !req.body.location.address) {
        errors.push('Vui lòng nhập địa chỉ!');
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors: errors
        });
    }
    next();
}

module.exports.roomValidate = (req, res, next) => {
    const errors = [];
    if (!req.body.name) {
        errors.push('Vui lòng nhập tên phòng!');
    }
    if (parseInt(req.body.price) <= 0) {
        errors.push('Vui lòng nhập giá lớn hơn 0!');
    }
    if (!req.body.amenities) {
        errors.push('Vui lòng nhập tiện ích phòng!');
    }
    if (parseInt(req.body.availableRooms) <= 0) {
        errors.push('Vui lòng nhập số lượng lớn hơn 0!');
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors: errors
        });
    }
    next();
}
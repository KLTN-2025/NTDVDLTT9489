module.exports.roleValidate = (req, res, next) => {
    const errors = [];
    if (!req.body.title) {
        errors.push('Vui lòng nhập tiêu đề!');
    }
    if (!req.body.description) {
        errors.push('Vui lòng nhập chi tiết nhóm quyền!');
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors: errors
        });
    }
    next();
}
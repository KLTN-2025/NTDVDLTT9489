module.exports.cancelOrder = (req, res, next) => {
    const error = [];
    if (!req.body.numberAccount) {
        error.push('Vui lòng nhập số tài khoản!');
    }

    if (!req.body.bankName) {
        error.push('Vui lòng nhập tên ngân hàng!');
    }

    if (error.length > 0) {
        return res.status(400).json({
            success: false,
            error: error
        });
    }
    next();
}
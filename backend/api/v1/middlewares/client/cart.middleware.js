const Cart = require("../../models/cart.model");
const User = require("../../models/user.model");

module.exports.cartId = async (req, res, next) => {

    if (req.cookies.cartId) {
        const cart = await Cart.findOne({
            _id: req.cookies.cartId
        });

        cart.totalQuantity = cart.tours.reduce((sum, item) => sum + item.quantity, 0);

        res.locals.minicart = cart;

    }
    next();
}
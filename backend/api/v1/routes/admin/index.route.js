const systemConfig = require("../../../../config/system");

const categoryRoutes = require("./category.route");
const tourRoutes = require("./tour.route");
const roleRoutes = require("./role.route");
const accountRoutes = require("./account.route");
const voucherRoutes = require("./voucher.route");
const orderRoutes = require("./order.route");
const settingRoutes = require("./setting.route");
const hotelRoutes = require("./hotel.route");
const reviewRoutes = require("./review.route");
const userRoutes = require("./user.route");
const settingsRoutes = require("./setting.route");
const dashBoardRoutes = require("./dashboard.route");

const authMiddleware = require("../../middlewares/admin/auth.middleware");

module.exports = (app) => {
    const version = "/api/v1";
    const PARTH_ADMIN = systemConfig.prefixAdmin;

    app.use(version + PARTH_ADMIN + "/categories", authMiddleware.requireAuth, categoryRoutes);
    app.use(version + PARTH_ADMIN + "/tours", authMiddleware.requireAuth, tourRoutes);
    app.use(version + PARTH_ADMIN + "/roles", authMiddleware.requireAuth, roleRoutes);
    app.use(version + PARTH_ADMIN + "/accounts", accountRoutes);
    app.use(version + PARTH_ADMIN + "/vouchers", authMiddleware.requireAuth, voucherRoutes);
    app.use(version + PARTH_ADMIN + "/orders", authMiddleware.requireAuth, orderRoutes);
    app.use(version + PARTH_ADMIN + "/settings", authMiddleware.requireAuth, settingRoutes);
    app.use(version + PARTH_ADMIN + "/hotels", authMiddleware.requireAuth, hotelRoutes);
    app.use(version + PARTH_ADMIN + "/reviews", authMiddleware.requireAuth, reviewRoutes);
    app.use(version + PARTH_ADMIN + "/users", authMiddleware.requireAuth, userRoutes);
    app.use(version + PARTH_ADMIN + "/settings", authMiddleware.requireAuth, settingsRoutes);
    app.use(version + PARTH_ADMIN + "/dashboard", authMiddleware.requireAuth, dashBoardRoutes);
}
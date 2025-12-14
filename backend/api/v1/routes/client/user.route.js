const express = require('express');
const router = express.Router();

const controller = require("../../controllers/client/user.controller");

const authMiddleware = require("../../middlewares/client/auth.middleware");
const validate = require("../../validates/client/user.validate");

router.post('/register', validate.registerPost, controller.register);
router.post('/login', validate.loginPost, controller.login);
router.post('/password/forgot', validate.forgotPassword, controller.forgotPassword);
router.post('/password/otp', controller.otpPassword);
router.post('/password/reset', controller.resetPassword);
router.get('/detail', authMiddleware.requireAuth, controller.detail);
router.get('/logout', controller.logout);
router.patch('/edit', authMiddleware.requireAuth, validate.edit, controller.edit);
router.patch('/password/change', authMiddleware.requireAuth, validate.changePassword, controller.changePass);
router.get('/orders', authMiddleware.requireAuth, controller.orderUser);
router.get('/ordersDetail/:id', authMiddleware.requireAuth, controller.orderDetail);

module.exports = router;
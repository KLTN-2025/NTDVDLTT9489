const express = require('express');
const router = express.Router();
const multer = require("multer");

const controller = require("../../controllers/admin/account.controller");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");
const validate = require("../../validates/admin/account.validate");
const upload = multer();

const authMiddleware = require("../../middlewares/admin/auth.middleware");

router.get("/", authMiddleware.requireAuth, controller.index);
router.post("/create", authMiddleware.requireAuth,
    upload.single('avatar'),
    uploadCloud.uploadSingle,
    validate.createAccount,
    controller.createPost);
router.post("/login", validate.loginPost, controller.login);
router.get("/detail/:id", authMiddleware.requireAuth, controller.detail);
router.patch("/edit/:id",
    upload.single('avatar'),
    uploadCloud.uploadSingle,
    authMiddleware.requireAuth,
    controller.edit);
router.patch("/changeStatus/:status/:id", authMiddleware.requireAuth, controller.changeStatus);
router.delete("/delete/:id", authMiddleware.requireAuth, controller.delete);

module.exports = router;
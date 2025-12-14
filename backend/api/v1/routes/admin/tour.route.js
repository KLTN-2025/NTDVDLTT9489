const express = require('express');
const multer = require("multer");
const router = express.Router();

const controller = require("../../controllers/admin/tour.controller");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");
const validate = require("../../validates/admin/tour.validate");
const upload = multer();

router.get("/", controller.index);
router.post('/create',
    upload.fields([{ name: 'images', maxCount: 10 }]),
    uploadCloud.uploadFields,
    validate.tourValidate,
    controller.createPost
);
router.patch("/change-status/:status/:id", controller.changeStatus);
router.delete("/delete/:id", controller.deleteTour);
router.patch("/edit/:id",
    upload.fields([{ name: 'images', maxCount: 10 }]),
    uploadCloud.uploadFields,
    controller.editPatch);
router.get("/detail/:id", controller.detail);

module.exports = router;
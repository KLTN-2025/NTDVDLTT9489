const express = require('express');
const router = express.Router();
const multer = require("multer");

const controller = require("../../controllers/admin/setting.controller");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");
const validate = require("../../validates/admin/setting.validate");
const upload = multer();

router.get('/general', controller.general);
router.patch('/general', upload.single('logo'),
    uploadCloud.uploadSingle,
    validate.settingValidate,
    controller.generalPatch);
router.patch('/slider', upload.fields([{ name: 'imageSliders', maxCount: 10 }]), uploadCloud.uploadFields, controller.slider);

module.exports = router;
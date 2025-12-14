const express = require('express');
const router = express.Router();
const multer = require("multer");

const controller = require("../../controllers/admin/category.controller");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");
const validate = require("../../validates/admin/category.validate");
const upload = multer();

router.get('/', controller.index);
router.post('/create', upload.single('image'),
    uploadCloud.uploadSingle,
    validate.categoryValidate,
    controller.create);
router.patch('/changeStatus/:status/:id', controller.changeStatus);
router.patch('/edit/:id',
    upload.single('image'),
    uploadCloud.uploadSingle,
    controller.edit);
router.get('/detail/:id', controller.detail);
router.delete('/delete/:id', controller.delete);

module.exports = router;
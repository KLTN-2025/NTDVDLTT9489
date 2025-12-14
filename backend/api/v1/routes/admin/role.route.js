const express = require('express');
const router = express.Router();

const controller = require("../../controllers/admin/role.controller");
const validate = require("../../validates/admin/role.validate");

router.get("/", controller.index);
router.post("/create", validate.roleValidate, controller.createPost);
router.patch("/edit/:id", controller.edit);
router.get("/detail/:id", controller.detail);
router.patch("/permissions", controller.permissionsPatch);
router.delete("/delete/:id", controller.delete);

module.exports = router;
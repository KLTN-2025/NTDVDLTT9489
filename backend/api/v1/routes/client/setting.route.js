const express = require('express');
const router = express.Router();

const controller = require("../../controllers/client/setting.controller");

router.get('/', controller.general);

module.exports = router;
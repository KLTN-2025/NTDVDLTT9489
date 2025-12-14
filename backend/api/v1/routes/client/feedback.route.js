const express = require('express');
const router = express.Router();

const controller = require("../../controllers/client/feddback.controller");

router.post('/', controller.feddback);

module.exports = router;
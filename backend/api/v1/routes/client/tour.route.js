const express = require('express');
const router = express.Router();

const controller = require("../../controllers/client/tour.controller");

router.get('/:slugCategory', controller.index);
router.get('/detail/:slugTour', controller.detail);

module.exports = router;
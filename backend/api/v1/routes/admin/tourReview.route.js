const express = require('express');
const router = express.Router();

const controller = require("../../controllers/admin/tourReview.controller");

router.get('/:tourId', controller.indexTour);
router.delete('/delete/:id', controller.deleteTour);

module.exports = router;

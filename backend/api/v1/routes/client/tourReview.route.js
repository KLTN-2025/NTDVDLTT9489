const express = require('express');
const router = express.Router();

const controller = require("../../controllers/client/tourReview.controller");
const authMiddleware = require("../../middlewares/client/auth.middleware");

router.post('/:tourId', authMiddleware.requireAuth, controller.review);
router.get('/get/:tourId', controller.getReviews);
router.delete('/delete/:id', authMiddleware.requireAuth, controller.delete);

module.exports = router;

const express = require('express');
const router = express.Router();

const controller = require("../../controllers/admin/review.controller");

router.get("/hotels/:hotelId", controller.indexHotel);
router.get("/rooms/:hotelId/:roomId", controller.indexRoom);
router.delete("/delete/:id", controller.deleteHotel);

module.exports = router;
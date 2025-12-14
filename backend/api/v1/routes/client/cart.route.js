const express = require('express');
const router = express.Router();

const controller = require("../../controllers/client/cart.controller");
const authMiddleware = require("../../middlewares/client/auth.middleware");

router.get('/', authMiddleware.requireAuth, controller.index);
router.post('/add/:tour_id', authMiddleware.requireAuth, controller.addPost);
router.post('/add/:hotel_id/:room_id', authMiddleware.requireAuth, controller.addPostHotel);
router.patch('/delete/:tour_id', authMiddleware.requireAuth, controller.delete);
router.patch('/deleteHotel/:hotel_id/:room_id', authMiddleware.requireAuth, controller.deleteRoom);
router.patch('/deleteHotel/:hotel_id', authMiddleware.requireAuth, controller.deleteHotel);
router.patch('/update/:tour_id/:timeDepart', authMiddleware.requireAuth, controller.update);
router.patch('/updateRoom/:hotel_id/:room_id', authMiddleware.requireAuth, controller.updateRoom);
router.patch('/updateRoomDate/:hotel_id/:room_id', authMiddleware.requireAuth, controller.updateRoomDate);

module.exports = router;
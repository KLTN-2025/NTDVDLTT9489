const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    hotel_id: String,
    name: String,
    price: Number,
    amenities: String,
    availableRooms: {
        type: Number,
        default: 0
    },
    sold: {
        type: Number,
        default: 0
    },
    images: Array,
    status: {
        type: String,
        default: "active"
    },
});

const Room = mongoose.model('Room', RoomSchema, "rooms");
module.exports = Room;
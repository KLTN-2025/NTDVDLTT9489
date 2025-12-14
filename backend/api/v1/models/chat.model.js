const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    history: [
        {
            role: {
                type: String,
                enum: ["system", "user", "assistant"],
                required: true,
            },
            content: {
                type: String,
                required: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        },
    ],
});

chatSchema.pre("save", function (next) {
    if (this.history.length > 10) {
        this.history = this.history.slice(-10);
    }
    next();
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;

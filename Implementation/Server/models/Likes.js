const mongoose = require("mongoose");

const LikeSchema = new mongoose.Schema({
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    PostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    },
    count: {
        type: Number,
        default: 1,
    },
});

const Like = mongoose.model("Likes", LikeSchema);

module.exports = Like;

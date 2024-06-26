const mongoose = require("mongoose");
const likePostSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        comment_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "comment_post",
            required: true,
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("like_comment", likePostSchema);

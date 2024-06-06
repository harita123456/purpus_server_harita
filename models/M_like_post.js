const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const likePostSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        post_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "post",
            required: true,
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("like_post", likePostSchema);

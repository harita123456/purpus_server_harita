const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const customField = new mongoose.Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        title: {
            type: String,
        },
        description: {
            type: String,
        },
        is_deleted: {
            type: Boolean,
            enum: [true, false],
            default: false, // true-deleted, false-Not_deleted
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("custom_field", customField);

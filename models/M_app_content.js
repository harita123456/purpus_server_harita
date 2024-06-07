const mongoose = require("mongoose");

const appcontentSchema = new mongoose.Schema(
    {
        about: {
            type: String,
        },
        termsAndconditions: {
            type: String,
        },
        privacy_policy: {
            type: String,
        },
        is_deleted: {
            type: Boolean,
            enum: [true, false],
            default: false, 
        },
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("app_content", appcontentSchema);
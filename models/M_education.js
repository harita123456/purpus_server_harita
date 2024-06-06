const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const educationSchema = new mongoose.Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        school: {
            type: String,
        },
        degree: {
            type: String,
        },
        field_of_Study: {
            type: String,
        },
        start_date: {
            type: Date,
        },
        end_date: {
            type: Date,
        },
        grade: {
            type: String,
        },
        activities_and_societies:
        {
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

module.exports = mongoose.model("education", educationSchema);


const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const locationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            default: "Point",
        },
        coordinates: {
            type: [Number],
            required: [true, "coordinates is required."], // [long , lat]
        },
    },
    { _id: false }
);


const mediaFileImage = new mongoose.Schema([
    {
        file_type: {
            type: String,
            enum: ["image", "video", "audio", "document", "emoji", "url"],
            required: [true, "File type is required."],
        },
        file_name: {
            type: String,
        },
        file_size: {
            type: Number, // size in bytes        convert into mb ==> 3002243 / 1024 / 1024         convert into kb ==> 3002243 / 1024
            default: null,
        },
        thumb_name: {
            type: String,
        },
        is_deleted: {
            type: Boolean,
            enum: [true, false],
            default: false, // true-deleted, false-Not_deleted
        },
    }
]);

const experience = new mongoose.Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        title: {
            type: String,
        },
        emp_type: {
            type: String,
        },
        company_name: {
            type: String,
        },
        location: {
            type: locationSchema,
        },
        address:
        {
            type: String,
        },
        is_cuurrently_working:
        {
            type: Boolean,
            enum: [true, false],
            default: false,
        },
        start_date: {
            type: Date,
        },
        end_date: {
            type: Date,
        },
        industry:
        {
            type: String,
        },
        description: {
            type: String,
        },
        media: {
            type: [mediaFileImage],
        },
        is_deleted: {
            type: Boolean,
            enum: [true, false],
            default: false, // true-deleted, false-Not_deleted
        },

    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("experience", experience);
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mediaFileImage = new mongoose.Schema([
  {
    file_type: {
      type: String,
      enum: ["image", "video"],
      required: [true, "File type is required."],
    },
    file_name: {
      type: String,
    },
    thumb_name: {
      type: String,
    },
  },
]);

const reportSchema = new mongoose.Schema(
  {
    feedback: {
      type: String,
      required: [true, "Feedback is required"],
    },
    feedback_photo: {
      type: [mediaFileImage],
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    is_block: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-block, false-Not_block
    },
    is_deleted: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-deleted, false-Not_deleted
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("report", reportSchema);

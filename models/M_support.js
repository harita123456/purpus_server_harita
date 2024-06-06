const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const supportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Feedback is required"],
    },
    message: {
      type: String,
      required: [true, "Feedback photo is required"],
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    is_deleted: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-deleted, false-Not_deleted
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("support", supportSchema);

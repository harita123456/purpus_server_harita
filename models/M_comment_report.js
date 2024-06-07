const mongoose = require("mongoose");
const commentreportSchema = new mongoose.Schema(
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
    comment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment_post",
      required: true,
    },
    reason_comment_report: {
      type: String,
      required: [true, "Reason is required"],
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

module.exports = mongoose.model("comment_report", commentreportSchema);

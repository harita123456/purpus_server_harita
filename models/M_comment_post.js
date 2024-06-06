const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: [true, "Content is required."],
    },
    parent_comment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment_post",
    },
    reply_comment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment_post",
    },
    mention_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    like_count: {
      type: Number,
      default: 0,
    },
    comment_reply_count: {
      type: Number,
      default: 0,
    },
    is_sub_comment: {
      type: Boolean,
      default: false, // true-sub_comment, false-Not_sub_comment
    },
    is_deleted: {
      type: Boolean,
      default: false, // true-deleted, false-Not_deleted
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("comment_post", commentSchema);

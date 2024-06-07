const mongoose = require("mongoose");

const userInteractionSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    interest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "interest", // Refers to interest model
      required: [false, "Interest id required"],
    },
    sub_interest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sub_interest", // Refers to sub interest model
      default: null
    },
    post_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post", // Refers to post_id
      required: [false, "Post id required"],
    },
    interaction_type: {
      type: String,
      enum: ["like", "comment", "share", "save", "repost", "post", "view", "poll"],
      required: [false, "Interaction type is required."],
    },
    is_comment: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-comment, false-comment
    },
    is_share_post: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-share, false-share
    },
    is_deleted: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-deleted, false-Not_deleted
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("user_interactions", userInteractionSchema);

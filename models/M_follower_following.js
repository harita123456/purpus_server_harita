const mongoose = require("mongoose");
const followerFollowingSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId, //login user_id
      ref: "users",
      required: true,
    },
    following_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    is_request: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-request for private, false-Not_request
    },
    is_deleted: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-deleted, false-Not_deleted
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("follower_following", followerFollowingSchema);

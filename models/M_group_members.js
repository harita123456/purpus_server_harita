const mongoose = require("mongoose");

const groupMembersSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "User Id is required."],
    },
    group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "group",
      required: [true, "Grpoup Id is required."],
    },
    in_screen: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-in screen , false - not in screen
    },
    is_admin: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-this user is group admin
    },
    is_deleted: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-deleted, false-Not_deleted
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("group_members", groupMembersSchema);

const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "User Id is required."],
    },
    group_name: {
      type: String,
      required: [true, "Group name is required."],
    },
    group_description: {
      type: String,
      required: [true, "Group description is required."],
    },
    group_image: {
      type: String,
      default: null,
    },
    interest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "interest", // Refers to interest model
    },
    sub_interest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sub_interest", // Refers to  sub interest model
    },
    group_code: { type: Number, required: [true, "Group code is required."] },
    is_private: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-this group is private, false-this group is public
    },
    is_deleted: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-deleted, false-Not_deleted
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("group", groupSchema);

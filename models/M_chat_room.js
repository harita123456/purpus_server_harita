const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "User Id is required."],
    },
    other_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Other user Id is required."],
    },
    room_code: { type: Number, required: [true, "Room code is required."] },
    screen_user_status: {
      type: Boolean,
      enum: [true, false],
      default: false, 
    },
    screen_otheruser_status: {
      type: Boolean,
      enum: [true, false],
      default: false, 
    },
    is_requested: {
      type: Boolean,
      enum: [true, false],
      default: false, 
    },
    is_deleted: {
      type: Boolean,
      enum: [true, false],
      default: false, 
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("chat_room", chatRoomSchema);

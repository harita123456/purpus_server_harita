const mongoose = require("mongoose");
const groupPollSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    group_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "group",
      required: false,
    },
    group_chat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "group_chat",
    },
    option_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "options",
    },
  },
  { timestamps: true, versionKey: false }
);
module.exports = mongoose.model("group_poll_votes", groupPollSchema);

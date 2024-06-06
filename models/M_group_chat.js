const mongoose = require("mongoose");

const mediaFileImage = new mongoose.Schema([
  {
    file_type: {
      type: String,
      enum: ["image", "video", "audio", "document", "emoji"],
      required: [true, "File type is required."],
    },
    file_name: {
      type: String,
    },
    video_name: {
      type: String,
    },
    thumbnail: {
      type: String,
    },
    message: {
      type: String,
      default: null,
    },
    audio_file: {
      type: String,
    },
    is_deleted_by: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
  },
]);

const optionsSchema = new mongoose.Schema([
  {
    option_key: {
      type: String,
    },
    option_value: {
      type: String,
    },
    option_vote: {
      type: Number,
      default: 0,
    },
    option_percentage: {
      type: Number,
      default: 0,
    },
  },
]);

const chatSchema = new mongoose.Schema(
  {
    group_id: {
      // group id needed when it's group messages
      type: mongoose.Schema.Types.ObjectId,
      ref: "group",
      required: false,
    },
    reply_message_id: {
      // reply message id is for any perticular message reply (parent message id)
      type: mongoose.Schema.Types.ObjectId,
      ref: "group_chat",
      required: false,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Sender id is required."],
    },
    receiver_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [true, "Receiver id is required."],
      },
    ],
    post_id:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
      default:null
    },
    message_time: {
      type: String,
      required: [true, "Message time is required."],
    },
    message: {
      type: String,
    },
    message_type: {
      type: String,
      enum: ["text", "media", "emoji", "gif", "poll","voice"],
      required: [true, "Message type is required."],
    },
    question: {
      type: String,
      default: null,
    },
    options: {
      type: [optionsSchema],
    },
    vote_counter: {
      type: Number,
      default: 0,
    },
    media_file: {
      type: [mediaFileImage],
    },
    is_read: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-read, false-unread
    },
    is_delete_by: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    is_read_by: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("group_chat", chatSchema);

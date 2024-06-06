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
    media_forwarding: {
      type: Boolean,
      enum: [true, false],
      default: false,
    },
    deleted_everyone: {
      type: Boolean,
      enum: [true, false],
      default: false,
    },
    is_everyOne: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
  },
]);

const chatSchema = new mongoose.Schema(
  {
    chat_room_id: {
      // chat room id  needed when it's individual messages
      type: mongoose.Schema.Types.ObjectId,
      ref: "chat_room",
      required: false,
    },
    reply_message_id: {
      // reply message id is for any perticular message reply (parent message id)
      type: mongoose.Schema.Types.ObjectId,
      ref: "chat",
      required: false,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Sender id is required."],
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Receiver id is required."],
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
      enum: ["text", "media", "emoji", "gif","voice","post"],
      required: [true, "Message type is required."],
    },
    post_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
      default:null
    },
    media_file: {
      type: [mediaFileImage],
    },
    is_group_message: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-is provider send a group message, false-it's a personal message
    },
    is_read: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-read, false-unread
    },
    replied_message_media: {
      type: [mediaFileImage],
    },
    is_delete_by: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("chat", chatSchema);
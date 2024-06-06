const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const notificationSchema = new mongoose.Schema(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
    receiver_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: false,
      },
    ],
    noti_title: {
      type: String,
      required: [true, "Notification title is required."],
    },
    noti_msg: {
      type: String,
      required: false,
    },
    follow_id: {
      type: Schema.Types.ObjectId,
      ref: "follower_following",
    },
    group_id: {
      type: Schema.Types.ObjectId,
      ref: "group",
    },
    group_chat_id: {
      type: Schema.Types.ObjectId,
      ref: "group_chat",
    },
    admin_notification_id: {
      type: Schema.Types.ObjectId,
      ref: "admin_notification",
    },
    post_id: {
      type: Schema.Types.ObjectId,
      ref: "post",
    },
    comment_id: {
      type: Schema.Types.ObjectId,
      ref: "comment_post",
    },
    noti_for: {
      type: String,
      enum: [
        "follow_request",            //  for private account request
        "started_following",          // direct follow
        "follow_request_accepted",     // follow request accepted
        "group_join_request",
        "group_invite",
        "group_join_request_accept",
        "group_join_request_decline",
        "admin_send",
        "like_post",
        "group_chat_message",
        "post_comment",
        "like_comment",
        "chat_noti",
        "group_chat_noti",
        "share_post",
        "repost",
        "verification_request"
      ],
    },
    noti_date: {
      type: Date,
      required: [true, "Notification date is required."],
    },
    is_sent_to_multiple: {
      type: Boolean,
      enum: [true, false],
      default: false, //  true - this noti send to multiple users  - receiver_ids
    },
    is_accepted: {
      type: Boolean,
      enum: [true, false],
      default: null, //  null - no req action, true- accepted,  false - not accepted
    },
    is_deleted: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-deleted, false-Not_deleted
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("notification", notificationSchema);

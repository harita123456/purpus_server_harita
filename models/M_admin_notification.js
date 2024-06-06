const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const AdminNotificationsModel = new Schema(
  {
    admin_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: false,
    },
    receiver_id: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: false,
      },
    ],
    individual_user_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: false,
      },
    ],
    sub_interest_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: "sub_interest",
        required: false,
      },
    ],
    notification_title: {
      type: String,
      required: true,
    },
    notification_text: {
      type: String,
      required: true,
    },
    notification_date: {
      type: Date,
      required: true,
    },
    is_all: {
      type: Boolean,
      required: true,
      default: false,
    },
    is_sub_interest: {
      type: Boolean,
      required: true,
      default: false,
    },
    is_individual: {
      type: Boolean,
      required: true,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    is_active: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("admin_notification", AdminNotificationsModel);

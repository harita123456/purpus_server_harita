const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportgroupSchema = new mongoose.Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId, //login_id
      ref: "users",
      required: true,
    },
    group_id: {
      type: Schema.Types.ObjectId, //which user that you have report
      ref: "group",
      required: true,
    },
    reason_report: {
      type: String,
      required: [true, "Reason is required"],
    },
    is_deleted: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-deleted, false-Not_deleted
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("group_report", reportgroupSchema);

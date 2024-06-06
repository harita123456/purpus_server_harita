const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const subinterestSchema = new mongoose.Schema(
  {
    interest_id: {
      type: Schema.Types.ObjectId,
      ref: "interest",
    },
    sub_interest: {
      type: String,
      required: [true, "Sub interest is required"],
    },
    hindi: {
      type: String,
      default: null
      // required: [true, "Interest is required"],
    },
    telugu: {
      type: String,
      default: null
      // required: [true, "Interest is required"],
    },
    kannada: {
      type: String,
      default: null
    },
    tamil:
    {
      type: String,
      default: null
    },
    malayalam:
    {
      type: String,
      default: null
    },
    is_deleted: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-deleted, false-Not_deleted
    },
    is_block:
    {
      type: Boolean,
      enum: [true, false],
      default: false, // true-block, false-Not_deleted
    }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("sub_interest", subinterestSchema);

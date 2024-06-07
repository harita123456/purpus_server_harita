const mongoose = require("mongoose");
const interestSchema = new mongoose.Schema(
  {
    interest: {
      type: String,
      required: [true, "Interest is required"],
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
    color_code: {
      type: String,
      required: [true, "color code is required"],
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

module.exports = mongoose.model("interest", interestSchema);

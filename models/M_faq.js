const mongoose = require("mongoose");
const FaqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Interest is required"],
    },
    answer: {
      type: String,
      required: [true, "color code is required"],
    },
    is_deleted: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-deleted, false-Not_deleted
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("faq", FaqSchema);

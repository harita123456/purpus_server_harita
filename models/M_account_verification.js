const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const accountVerification = new mongoose.Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    legal_name: {
      type: String,
      required: [true, "legal name is required"],
    },
    dob: {
      type: Date,
      required: [true, "date is required"],
    },
    country_name: {
      type: String,
      required: [true, "date is required"],
    },
    profession: {
      type: String,
      required: [true, "profession is required"],
    },
    gov_document: {
      type: String,
      required: [true, "gov document is required"],
    },
    social_link: {
      type: String,
      required: [true, "social_link is required"],
    },
    news_source_one: {
      type: String,
      required: [true, "news source one is required"],
    },
    news_source_two: {
      type: String,
      required: [true, "news source two  is required"],
    },
    news_source_three: {
      type: String,
      required: [true, "news source threeis required"],
    },
    verified_status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
    },
    is_deleted: {
      type: Boolean,
      enum: [true, false],
      default: false, 
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("account_verification", accountVerification);

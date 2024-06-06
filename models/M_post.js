const mongoose = require("mongoose");
const locationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: [true, "coordinates is required."], // [long , lat]
    },
  },
  { _id: false }
);
const mediaFileImage = new mongoose.Schema([
  {
    file_type: {
      type: String,
      enum: ["image", "video"],
      required: [true, "File type is required."],
    },
    file_name: {
      type: String,
    },
    thumb_name: {
      type: String,
    },
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

const postSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    repost_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
    interest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "interest", // Refers to interest model
      required: [true, "Category required"],
    },
    sub_interest_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sub_interest", // Refers to  sub interest model
    },
    title: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      required: false,
      default: null,
    },
    post_type: {
      type: String,
      enum: ["media", "text", "link", "poll"],
      default: "text",
    },
    link_url: {
      type: String,
      default: null,
    },
    post_media: {
      type: [mediaFileImage],
    },
    question: {
      type: String,
      default: null,
    },
    store_option_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "options", // for which options choose user
      default: null,
    },
    options: {
      type: [optionsSchema],
    },
    location: {
      type: locationSchema,
    },
    is_repost: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-repost, false-Not_repost
    },
    impression_count: {
      type: Number,
      default: 0,
    },
    interaction_count: {
      type: Number,
      default: 0,
    },
    vote_counter: {
      //for vote
      type: Number,
      default: 0,
    },
    report_post_count:
    {
      type: Number,
      default: 0,
    },
    repost_count: {
      type: Number,
      default: 0,
    },
    view_count: {
      type: Number,
      default: 0,
    },
    comment_count: {
      type: Number,
      default: 0,
    },
    like_count: {
      type: Number,
      default: 0,
    },
    is_local: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-local, false-Not_local
    },
    is_block: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-block, false-Not_block
    },
    is_fake_post: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-deleted, false-Not_deleted
    },
    is_fake_post_updated: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-deleted, false-Not_deleted
    },
    is_deleted: {
      type: Boolean,
      enum: [true, false],
      default: false, // true-deleted, false-Not_deleted
    },
  },
  { timestamps: true, versionKey: false }
);

postSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("post", postSchema);

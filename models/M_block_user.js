const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blockUserSchema = new mongoose.Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId, 
      ref: "users",
      required: true,
    },
    block_user_id: {
      type: Schema.Types.ObjectId, 
      ref: "users",
      required: true,
    },
    is_deleted: {
      type: Boolean,
      enum: [true, false],
      default: false, 
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("block_user", blockUserSchema);

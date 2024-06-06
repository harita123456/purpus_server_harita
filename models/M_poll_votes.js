const mongoose = require("mongoose");
const pollSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "post",
  },
  option_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "options",
  },
});
module.exports = mongoose.model("poll_votes", pollSchema);

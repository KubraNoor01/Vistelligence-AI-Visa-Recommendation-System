const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  name: { type: String, required: true },
  picture: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "catagories", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Add user reference
  status: { type: String, enum: ["approved", "reported", "declined"], default: "approved" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", postSchema);

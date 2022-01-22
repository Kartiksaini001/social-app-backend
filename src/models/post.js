const mongoose = require("mongoose");

const postSchema = mongoose.Schema(
  {
    imageUrl: { type: String, trim: true, default: null },
    cloudinaryId: { type: String, default: null },
    caption: { type: String, trim: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;

const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    name: { type: String, trim: true, default: null },
    hash: { type: String, required: true, select: false },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    email_verified: { type: Boolean, default: false },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friendRequestsSent: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    profilePic: { type: String, default: null },
    college: { type: String, default: null },
    city: { type: String, default: null },
    cloudinaryId: { type: String, default: null },
    sharedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;

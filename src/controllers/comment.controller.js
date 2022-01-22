const mongoose = require("mongoose");
const Post = require("../models/post");
const Comment = require("../models/comment");
const { findByIdAndUpdate } = require("../models/post");

const fetchAllComments = async (req, res) => {
  try {
    // res.status(200).json({ success: true, message: "" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    // validate postId
    if (!mongoose.Types.ObjectId.isValid(postId))
      return res
        .status(404)
        .json({ success: false, message: "Invalid post id" });

    if (!content)
      return res
        .status(400)
        .json({ success: false, message: "Comment cannot be empty" });

    let post = await Post.findById(postId);

    // if no post found
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "No post with given id" });

    // create new comment
    const newComment = new Comment({ content, author: req.userId });
    await newComment.save();

    // add comment id in post
    post.comments.unshift(newComment._id);

    // update the post
    await Post.findByIdAndUpdate(postId, post);

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: newComment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const fetchComment = async (req, res) => {
  try {
    // res.status(200).json({ success: true, message: "" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const updateComment = async (req, res) => {
  try {
    // res.status(200).json({ success: true, message: "" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const deleteComment = async (req, res) => {
  try {
    // res.status(200).json({ success: true, message: "" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const replyToComment = async (req, res) => {
  try {
    // res.status(200).json({ success: true, message: "" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

module.exports = {
  fetchAllComments,
  createComment,
  fetchComment,
  updateComment,
  deleteComment,
  replyToComment,
};

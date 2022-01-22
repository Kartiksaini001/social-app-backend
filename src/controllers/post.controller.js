const axios = require("axios");
const Post = require("../models/post");

const fetchAllPosts = async (req, res) => {
  try {
    const page = req.query.page ? req.query.page : 1;
    const limit = req.query.perPage ? req.query.perPage : 20;
    const skip = limit * (page - 1);

    // fetch posts
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      data: posts,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const createPost = async (req, res) => {
  try {
    // res.status(200).json({ success: true, message: "" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const fetchPost = async (req, res) => {
  try {
    const { id } = req.params;

    // validate postId
    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(404)
        .json({ success: false, message: "Invalid post id" });

    const post = await Post.findById(id);

    // if no post found
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "No post with given id" });

    res.status(200).json({
      success: true,
      message: "Post fetched successfully",
      data: post,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const updatePost = async (req, res) => {
  try {
    // res.status(200).json({ success: true, message: "" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const deletePost = async (req, res) => {
  try {
    // res.status(200).json({ success: true, message: "" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const likePost = async (req, res) => {
  try {
    // res.status(200).json({ success: true, message: "" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const sharePost = async (req, res) => {
  try {
    // res.status(200).json({ success: true, message: "" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

module.exports = {
  fetchAllPosts,
  createPost,
  fetchPost,
  updatePost,
  deletePost,
  likePost,
  sharePost,
};

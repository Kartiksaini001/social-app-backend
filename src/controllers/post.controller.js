const axios = require("axios");
const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");
const { mediaPort } = require("../config/vars");

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
    const { caption } = req.body;

    if (!req.file && !caption)
      return res
        .status(400)
        .json({ success: false, message: "No data given for post" });

    // create a post
    let newPost = new Post({ creator: req.userId });

    // add image url if provided
    if (req.file) {
      const uploadRes = await axios.post(
        `http://localhost:${mediaPort}/media/upload`,
        req.file
      );

      if (uploadRes.status == 500) return res.status(500).json(uploadRes);

      newPost.imageUrl = uploadRes.data.data.secure_url;
      newPost.cloudinaryId = uploadRes.data.data.public_id;
    }

    // add caption if provided
    if (caption) newPost.caption = caption;

    // save the post
    await newPost.save();

    res.status(200).json({
      success: true,
      message: "Post created successfully",
      data: newPost,
    });
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
    const { id } = req.params;

    // validate postId
    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(404)
        .json({ success: false, message: "Invalid post id" });

    let post = await Post.findById(id);

    // if no post found
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "No post with given id" });

    if (post.creator.toString() !== req.userId)
      return res
        .status(401)
        .json({ success: false, message: "Cannot update this post" });

    const { caption } = req.body;

    if (!req.file && !caption)
      return res
        .status(400)
        .json({ success: false, message: "No data given for post" });

    // add image url if provided
    if (req.file) {
      if (post.imageUrl !== null) {
        const removeRes = await axios.delete(
          `http://localhost:${mediaPort}/media/remove/${post.cloudinaryId}`
        );

        if (removeRes.status == 500) return res.status(500).json(removeRes);
      }

      const uploadRes = await axios.post(
        `http://localhost:${mediaPort}/media/upload`,
        req.file
      );

      if (uploadRes.status == 500) return res.status(500).json(uploadRes);

      post.imageUrl = uploadRes.data.data.secure_url;
      post.cloudinaryId = uploadRes.data.data.public_id;
    }

    // add caption if provided
    if (caption) post.caption = caption;

    // update the post
    const updatedPost = await Post.findByIdAndUpdate(id, post, { new: true });

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    // validate postId
    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(404)
        .json({ success: false, message: "Invalid post id" });

    let post = await Post.findById(id);

    // if no post found
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "No post with given id" });

    if (post.creator.toString() !== req.userId)
      return res
        .status(401)
        .json({ success: false, message: "Cannot update this post" });

    // delete the comments
    post.comments.map((commentId) => {
      await Comment.findByIdAndDelete(commentId);
    });

    // delete the post
    await Post.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const likePost = async (req, res) => {
  try {
    const { id } = req.params;

    // validate postId
    if (!mongoose.Types.ObjectId.isValid(id))
      return res
        .status(404)
        .json({ success: false, message: "Invalid post id" });

    let post = await Post.findById(id);

    // if no post found
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "No post with given id" });

    let message = "Post liked successfully";

    const index = post.likes.findIndex(
      (id) => id.toString() === String(req.userId)
    );
    if (index === -1) {
      // Like the post
      post.likes.unshift(req.userId);
    } else {
      // Dislike the post
      post.likes = post.likes.filter(
        (id) => id.toString() !== String(req.userId)
      );
      message = "Post unliked successfully";
    }

    // update the post
    await PostMessage.findByIdAndUpdate(id, post);

    res.status(200).json({ success: true, message });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const sharePost = async (req, res) => {
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

    // fetch the user
    let user = await User.findById(req.userId);

    // add the postId
    user.sharedPosts.unshift(id);

    // update the user
    await User.findByIdAndUpdate(req.userId, user);

    res
      .status(200)
      .json({ success: true, message: "Post shared successfully" });
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

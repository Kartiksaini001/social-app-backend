const Comment = require("../models/comment");

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
    // res.status(200).json({ success: true, message: "" });
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

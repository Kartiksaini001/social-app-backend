const router = require("express").Router();
const {
  fetchAllPosts,
  createPost,
  fetchPost,
  updatePost,
  deletePost,
  likePost,
  sharePost,
} = require("../controllers/post.controller");
const {
  fetchAllComments,
  createComment,
  fetchComment,
  updateComment,
  deleteComment,
  replyToComment,
} = require("../controllers/comment.controller");
const { auth } = require("../middlewares/auth");
const upload = require("../config/multer");

router.get("/", auth, fetchAllPosts);
router.post("/", auth, upload.single("image"), createPost);
router.get("/:id", auth, fetchPost);
router.patch("/:id", auth, updatePost);
router.delete("/:id", auth, deletePost);
router.patch("/:id/likes", auth, likePost);
router.patch("/:id/share", auth, sharePost);
router.get("/:postId/comments", auth, fetchAllComments);
router.post("/:postId/comments", auth, createComment);
router.get("/:postId/comments/:commentId", auth, fetchComment);
router.patch("/:postId/comments/:commentId", auth, updateComment);
router.delete("/:postId/comments/:commentId", auth, deleteComment);
router.post("/:postId/comments/:commentId/reply", auth, replyToComment);

module.exports = router;

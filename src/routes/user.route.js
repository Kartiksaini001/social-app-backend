const router = require("express").Router();
const {
  getUsers,
  getFriends,
  getFriendRequests,
  getFriendRequestsSent,
  getBlockedUsers,
  signup,
  getUser,
  updateUser,
  verifyEmail,
  forgotPassword,
  updatePassword,
} = require("../controllers/user.controller");
const { auth } = require("../middlewares/auth");

router.get("/", getUsers);
router.get("/friends", auth, getFriends);
router.get("/friends/requests", auth, getFriendRequests);
router.get("/friends/requests/sent", auth, getFriendRequestsSent);
router.get("/block", auth, getBlockedUsers);
router.post("/signup", signup);
router.post("/forgot_password", forgotPassword);
router.post("/update_password/:token", updatePassword);
router.get("/email_verify/:token", verifyEmail);
router.get("/:id", auth, getUser);
router.put("/:id", auth, updateUser);

module.exports = router;

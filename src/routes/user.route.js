const router = require("express").Router();
const {
  getUsers,
  signup,
  getUser,
  updateUser,
  verifyEmail,
} = require("../controllers/user.controller");
const { auth } = require("../middlewares/auth");

router.get("/", getUsers);
router.post("/signup", signup);
router.get("/email_verify/:token", verifyEmail);
router.get("/:id", auth, getUser);
router.put("/:id", auth, updateUser);

module.exports = router;

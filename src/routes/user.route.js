const router = require("express").Router();
const { getUsers, signup } = require("../controllers/user.controller");

router.get("/", getUsers);
router.post("/signup", signup);

module.exports = router;

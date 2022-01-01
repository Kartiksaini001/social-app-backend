const router = require("express").Router();
const { verifyEmail } = require("../controllers/email.controller");

router.post("/verify", verifyEmail);

module.exports = router;

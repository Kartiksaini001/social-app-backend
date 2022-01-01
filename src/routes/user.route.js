const router = require("express").Router();
const { getUsers } = require("../controllers/user.controller");

router.get("/", getUsers);

module.exports = router;

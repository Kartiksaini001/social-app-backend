const router = require("express").Router();
const { uploadMedia } = require("../controllers/media.controller");

router.post("/upload", uploadMedia);

module.exports = router;

const router = require("express").Router();
const { uploadMedia, removeMedia } = require("../controllers/media.controller");

router.post("/upload", uploadMedia);
router.delete("/remove/:id", removeMedia);

module.exports = router;

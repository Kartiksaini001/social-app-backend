const router = require("express").Router();
const upload = require("../config/multer.js");
const { uploadMedia } = require("../controllers/media.controller");

router.post("/upload", upload.single("image"), uploadMedia);

module.exports = router;

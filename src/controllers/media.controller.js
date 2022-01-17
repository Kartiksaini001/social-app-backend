const cloudinary = require("../config/cloudinary");

const uploadMedia = async (req, res) => {
  try {
    const uploadRes = await cloudinary.uploader.upload(req.body.path);

    res.status(200).json({ success: true, data: uploadRes });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

const removeMedia = async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.params.id);

    res.status(200).json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Something Went Wrong..." });
  }
};

module.exports = { uploadMedia, removeMedia };

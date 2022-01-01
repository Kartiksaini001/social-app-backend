const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/vars");

const auth = async (req, res, next) => {
  try {
    const token = req.headers?.authorization?.split(" ")[1];

    // decode userId from token and set in request
    if (token) {
      const decodedData = jwt.verify(token, jwtSecret);
      req.userId = decodedData?.id;
    }

    next();
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { auth };

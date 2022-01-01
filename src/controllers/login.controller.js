const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const vars = require("../config/vars");
const { sendVerificationEmail } = require("../helpers/email");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // check if user with the given username exists
    const existingUser = await User.findOne({ username }).select("+hash");
    if (!existingUser)
      return res
        .status(404)
        .json({ success: false, message: "User does not exist." });

    // check if email is verified
    if (!existingUser.email_verified) {
      // check if there is a verified user
      const verifiedUser = await User.findOne({
        $and: [{ email: existingUser.email }, { email_verified: true }],
      });

      // if a verified user exists, don't allow other accounts
      if (verifiedUser)
        return res.status(401).json({
          success: false,
          message:
            "User with that email already exists. Please use a different email.",
        });
      else {
        // send verification email
        sendVerificationEmail(existingUser._id, existingUser.email);

        return res.status(401).json({
          success: false,
          message:
            "Please verify the email to login. Verification email is sent.",
        });
      }
    }

    // compare the hashes of the two passwords
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.hash);

    // check if password is correct
    if (!isPasswordCorrect)
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });

    // generate auth token
    const token = jwt.sign({ id: existingUser._id }, vars.jwtSecret, {
      expiresIn: vars.jwtExpirationInterval,
    });

    res.status(200).json({ success: true, user: existingUser, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { login };

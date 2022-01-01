const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { sendVerificationEmail } = require("../helpers/email");
const { validPassword } = require("../helpers/validate");

const getUsers = async (req, res) => {
  try {
    let { page } = req.query;
    if (!page) page = 1;

    // response limit
    const LIMIT = 100;
    // Get the starting index of every page
    const startIndex = (Number(page) - 1) * LIMIT;
    const totalUsers = await User.countDocuments({});

    const users = await User.find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);

    res.status(200).json({
      success: true,
      data: users,
      currentPage: Number(page),
      numberOfPages: Math.ceil(totalUsers / LIMIT),
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // check if user with given username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({
        success: false,
        message:
          "User already exists with that username. Please login or choose a different username",
      });

    // check if user with given email already exists and the email is verified
    const existingVerifiedUser = await User.findOne({
      $and: [{ email }, { email_verified: true }],
    });
    
    if (existingVerifiedUser)
      return res.status(400).json({
        success: false,
        message:
          "User already exists with that email. Please login or choose a different email",
      });

    // validate password
    if (!validPassword(password))
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one letter and one number",
      });

    // hash the password
    const hash = await bcrypt.hash(password, 12);

    // create user with given details
    const newUser = await User.create({
      username,
      email,
      hash,
    });

    // send verification email
    sendVerificationEmail(newUser._id, email);

    res.status(201).json({
      success: true,
      message:
        "New user created and verification mail is sent. Please verify your email to login",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, signup };

const nodemailer = require("nodemailer");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const vars = require("../config/vars");

const createTransporter = () =>
  nodemailer.createTransport({
    host: vars.emailConfig.host,
    auth: {
      user: vars.emailConfig.username,
      pass: vars.emailConfig.password,
    },
  });

const toSendVerificationEmail = async (to, verificationToken) => {
  await axios.post(`http://localhost:${vars.emailConfig.port}/email/verify`, {
    to,
    verificationToken,
  });
};

const sendVerificationEmail = async (userId, email) => {
  // generate auth token
  const verificationToken = jwt.sign({ id: userId }, vars.jwtSecret, {
    expiresIn: vars.jwtVerifyEmailExpirationInterval,
  });

  // Send verification email
  toSendVerificationEmail(email, verificationToken);
};

module.exports = { createTransporter, sendVerificationEmail };

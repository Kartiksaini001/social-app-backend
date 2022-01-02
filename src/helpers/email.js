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

const sendVerificationEmail = async (userId, email) => {
  // generate auth token
  const verificationToken = jwt.sign({ id: userId }, vars.jwtSecret, {
    expiresIn: vars.jwtVerifyEmailExpirationInterval,
  });

  // Send verification email
  await axios.post(
    `http://localhost:${vars.emailConfig.port}/email/verify_email`,
    {
      to: email,
      verificationToken,
    }
  );
};

const sendResetPasswordEmail = async (userId, email) => {
  // generate auth token
  const verificationToken = jwt.sign({ id: userId }, vars.jwtSecret, {
    expiresIn: vars.jwtResetPassExpirationInterval,
  });

  // Send email
  await axios.post(
    `http://localhost:${vars.emailConfig.port}/email/verify_password`,
    {
      to: email,
      verificationToken,
    }
  );
};

module.exports = {
  createTransporter,
  sendVerificationEmail,
  sendResetPasswordEmail,
};

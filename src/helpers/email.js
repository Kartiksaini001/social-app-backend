const nodemailer = require("nodemailer");
const axios = require("axios");
const { emailConfig } = require("../config/vars");

const createTransporter = () =>
  nodemailer.createTransport({
    host: emailConfig.host,
    auth: {
      user: emailConfig.username,
      pass: emailConfig.password,
    },
  });

const sendVerificationEmail = async (to, verificationToken) => {
  await axios.post(`http://localhost:${emailConfig.port}/email/verify`, {
    to,
    verificationToken,
  });
};

module.exports = { createTransporter, sendVerificationEmail };

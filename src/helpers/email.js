const nodemailer = require("nodemailer");
const { emailConfig } = require("../config/vars");

const createTransporter = () =>
  nodemailer.createTransport({
    host: emailConfig.host,
    auth: {
      user: emailConfig.username,
      pass: emailConfig.password,
    },
  });

module.exports = { createTransporter };

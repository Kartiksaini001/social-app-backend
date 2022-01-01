const path = require("path");

// import .env variables
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpirationInterval: process.env.JWT_EXPIRATION_INTERVAL,
  jwtResetPassExpirationInterval:
    process.env.JWT_RESET_PASSWORD_EXPIRATION_INTERVAL,
  jwtVerifyEmailExpirationInterval:
    process.env.JWT_VERIFY_EMAIL_EXPIRATION_INTERVAL,
  mongo: {
    uri: process.env.MONGO_URI,
  },
  emailConfig: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    username: process.env.EMAIL_USERNAME,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM,
  },
};

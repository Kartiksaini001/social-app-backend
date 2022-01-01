const vars = require("../config/vars");
const { createTransporter } = require("../helpers/email");

const transporter = createTransporter();

const verifyEmail = async (req, res) => {
  const { to, verificationToken } = req.body;

  try {
    // create email message
    let message = {
      from: vars.emailConfig.from,
      to: to,
      subject: "Social Media App - Verify your email",
      text: `Click on the link below to verify your Email. The link will be valid for 2 hours\n\nhttp://localhost:5000/users/email_verify/${verificationToken}`,
    };

    // send email
    await transporter.sendMail(message);

    res.status(200).json({
      success: true,
      message: `Verification email sent successfully to: ${to}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { verifyEmail };

const router = require("express").Router();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const EmailVerificationModel = require("../models/EmailVerificationModel");
const UsersModel = require("../models/UsersModel");
const bcrypt = require("bcrypt");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
function getMailOptions(email, otp) {
  return {
    from: `"Infinite Fortune" ${process.env.EMAIL_USER}`,
    to: email,
    subject: "Your OTP Code for Verification",
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
      <h2 style="color: #007bff; text-align: center;">Email Verification</h2>
      <p>Hello,</p>
      <p>Your One-Time Password (OTP) for verification is:</p>
      <h1 style="text-align: center; color: #333; background: #f4f4f4; padding: 10px; border-radius: 5px;">${otp}</h1>
      <p>This OTP is valid for <b>5 minutes</b>.</p>
      <p>If you did not request this, please ignore this email.</p>
      <hr>
      <p style="font-size: 12px; color: #666; text-align: center;">
        &copy; 2025 Infinite Fortune | <a href="https://yourwebsite.com" style="color: #007bff;">Visit Our Website</a> | <a href="https://yourwebsite.com/unsubscribe" style="color: red;">Unsubscribe</a>
      </p>
    </div>  `,
  };
}

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!pattern.test(email))
    return res.status(400).json({ error: "Invalid Email address" });

  try {
    if (await UsersModel.findOne({ email })) {
      return res.status(309).json({ message: "Email already exists" });
    }
    const otp = crypto.randomInt(1000, 9999).toString();
    const mailOptions = getMailOptions(email, otp);

    await transporter.sendMail(mailOptions);
    const hashOTP = await bcrypt.hash(otp, 10);
    const isExistsEmail = await EmailVerificationModel.findOne({ email });

    if (!isExistsEmail) {
      await EmailVerificationModel.create({ email, otp: hashOTP });
    } else {
      isExistsEmail.otp = hashOTP;
      isExistsEmail.createdAt = new Date();
      await isExistsEmail.save();
    }

    return res.status(202).json({ message: "OTP sent Successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Error sending OTP" });
  }
});
router.post("/forgot-password-send-otp", async (req, res) => {
  const { email } = req.body;
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!pattern.test(email))
    return res.status(400).json({ error: "Invalid Email address" });

  try {
    const user = await UsersModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User Not Found! Please Signup" });
    }
    const otp = crypto.randomInt(1000, 9999).toString();
    const mailOptions = getMailOptions(email, otp);

    await transporter.sendMail(mailOptions);
    const hashOTP = await bcrypt.hash(otp, 10);
    const isExistsEmail = await EmailVerificationModel.findOne({ email });

    if (!isExistsEmail) {
      await EmailVerificationModel.create({ email, otp: hashOTP });
    } else {
      isExistsEmail.otp = hashOTP;
      isExistsEmail.createdAt = new Date();
      await isExistsEmail.save();
    }

    return res.status(202).json({ message: "OTP sent Successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Error sending OTP" });
  }
});

module.exports = router;

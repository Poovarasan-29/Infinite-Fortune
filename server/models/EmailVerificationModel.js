const mongoose = require("mongoose");

const EmailVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 },
});

const EmailVerificationModel = mongoose.model(
  "emailVerification",
  EmailVerificationSchema
);
module.exports = EmailVerificationModel;

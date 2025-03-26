const router = require("express").Router();
const bcrypt = require("bcrypt");
const EmailVerificationModel = require("../models/EmailVerificationModel");
const UsersModel = require("../models/UsersModel");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const AdminModel = require("../models/AdminModel");

const checkOtpMiddleware = async (req, res, next) => {
  const { otp, email } = req.body;

  const emailVerificationUserData = await EmailVerificationModel.findOne({
    email,
  });
  if (!emailVerificationUserData) {
    return res.status(400).json({ success: false, message: "OTP expired" });
  }

  const isOtpMatched = await bcrypt.compare(otp, emailVerificationUserData.otp);
  if (!isOtpMatched)
    return res.status(400).json({
      success: false,
      message: "Invalid OTP. Please try again",
    });
  next();
};

router.post("/signup", checkOtpMiddleware, async (req, res) => {
  const { name, email, password, referrer } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);
  let userId = crypto.randomInt(100000, 999999).toString();
  const existUserIds = await UsersModel.find({}, { userId: 1, _id: 0 });
  while (existUserIds.some((id) => id.userId == userId)) {
    userId = crypto.randomInt(100000, 999999).toString();
  }

  try {
    // Create new user
    await UsersModel.create({
      name,
      email, 
      password: hashPassword,
      userId,
      referrer,
      rechargedBalance: 0,
    });
    //   Update the Referrer
    await UsersModel.findOneAndUpdate(
      { userId: referrer },
      { $push: { referrals: userId } }
    );

    return res.status(201).json({ message: "Successfully registered" });
  } catch (error) {
    return res.status(500).json({ message: "Error while signup, Try again" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await UsersModel.findOne({ email });

  if (!user)
    return res
      .status(404)
      .json({ message: "User not found. Please sign up first!" });

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched)
    return res.status(401).json({ message: "Password is incorrect" });

  const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
  return res
    .status(200)
    .json({ message: "Welcome Back! " + user.name, user, token });
});

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const verified = jwt.verify(
      token.split(" ")[1],
      process.env.JWT_SECRET_KEY
    );
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

router.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "Protected data", user: req.user });
});

router.post(
  "/forgot-password-request",
  checkOtpMiddleware,
  async (req, res) => {
    const { email, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);

    try {
      // Create new user
      await UsersModel.updateOne(
        {
          email,
        },
        {
          $set: { password: hashPassword },
        }
      );
      return res.status(200).json({ message: "Password Changed" });
    } catch (error) {
      return res.status(500).json({ message: "Server error! Try again" });
    }
  }
);

//Admin
router.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await AdminModel.findOne({ email });
  if (!user)
    return res
      .status(404)
      .json({ message: "User not found. Please sign up first!" });

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched)
    return res.status(401).json({ message: "Password is incorrect" });

  const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "24h",
  });
  return res
    .status(200)
    .json({ message: "Welcome Back! " + user.name, user, token });
});

// Only for Creating a new Admin --- Caution:Don't use this
router.post("/admin/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);
  let userId = crypto.randomInt(100000, 999999).toString();
  const existUserIds = await AdminModel.find({}, { userId: 1, _id: 0 });
  while (existUserIds.includes(userId)) {
    userId = crypto.randomInt(100000, 999999).toString();
  }

  try {
    // Create new user
    await AdminModel.create({
      name,
      email,
      password: hashPassword,
      userId,
    });
    //   Update the Referrer
    return res.status(201).json({ message: "Successfull" });
  } catch (error) {
    return res.json({ message: "Error while signup, Try again" });
  }
});

module.exports = router;

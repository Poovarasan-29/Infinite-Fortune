const UsersModel = require("../models/UsersModel");

const router = require("express").Router();

router.post("/daily-check-in", async (req, res) => {
  const { userId } = req.body;
  const user = await UsersModel.findOne({ userId });

  if (user.isClaimedToday)
    return res.json({ message: "Already Claimed. Come Tomorrow!" });
  user.isClaimedToday = true;
  user.balance = (user.balance || 0) + user.dailyClaim;
  user.withdrawalBalanace = (user.withdrawalBalanace || 0) + user.dailyClaim;
  try {
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error! Kindly Try Again" });
  }
});

module.exports = router;

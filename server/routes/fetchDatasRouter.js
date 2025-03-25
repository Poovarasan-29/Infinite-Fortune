const AdminModel = require("../models/AdminModel");
const UsersModel = require("../models/UsersModel");

const router = require("express").Router();

router.get("/getUserDatasForDashboard", async (req, res) => {
  const { userId } = req.query;

  const user = await UsersModel.findOne({ userId });
  if (user) return res.status(200).json(user);
  return res.status(404).json({ message: "User not found" });
});

module.exports = router;

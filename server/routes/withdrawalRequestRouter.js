const AdminModel = require("../models/AdminModel");
const UsersModel = require("../models/UsersModel");

const router = require("express").Router();

router.post("/withdrawal", async (req, res) => {
  const { userId, transferToUPI, amount } = req.body;

  try {
    await AdminModel.findOneAndUpdate(
      { email: "spking222005@gmail.com" },
      {
        $push: {
          withdrawalRequests: { userId, transferToUPI, amount },
        },
      }
    );
    await UsersModel.findOneAndUpdate(
      { userId },
      {
        $push: {
          withdrawalRequests: {
            transferToUPI,
            amount,
            status: "Pending",
            transactionId: "",
          },
        },
        $inc: { withdrawalBalanace: -parseInt(amount) },
      }
    );
    res.status(200).json({ message: "Added" });
  } catch (error) {
    res.status(400).json({ message: "Try Again" });
  }
});

router.get("/user-withdrawal-history", async (req, res) => {
  const userId = req.query.userId;

  const userWithdrawalHistory = await UsersModel.findOne(
    { userId },
    { withdrawalRequests: 1, _id: 0 }
  );

  if (!userWithdrawalHistory)
    return res.status(404).json({ message: "User Not Found" });

  return res.status(200).json({
    message: "Data found",
    withdrawalHistory: userWithdrawalHistory.withdrawalRequests,
  });
});

router.get("/admin-withdrawal-requests", async (req, res) => {
  try {
    const getWithdrawalRequests = await AdminModel.findOne(
      { email: "spking222005@gmail.com" },
      { withdrawalRequests: 1, _id: 0 }
    );

    return res.status(200).json(getWithdrawalRequests.withdrawalRequests);
  } catch (error) {
    res.status(400).json({ message: "Error to fetch data" });
  }
});

router.put("/success-withdrawal-request", async (req, res) => {
  const { userId, transactionId, amount, transferToUPI } = req.body;
 

  const user = await UsersModel.findOne({
    userId,
  });

  const isValid = user.withdrawalRequests.some(
    (val) => val.amount == amount && val.status == "Pending"
  );
  if (!isValid)
    return res.status(400).json({ message: "Wrong withdrawal request" });

  user.withdrawalRequests.at(-1).status = "Success";
  user.withdrawalRequests.at(-1).transactionId = transactionId;
  await user.save();

  const adminUpdated = await AdminModel.findOneAndUpdate(
    { email: "spking222005@gmail.com" },
    {
      $pull: { withdrawalRequests: { userId } }, // Remove the request from withdrawalRequests
      $push: {
        acceptedWithdrawalRequests: {
          userId,
          transactionId,
          amount,
          transferToUPI,
        },
      }, // Add to acceptedwithdrawalRequests
    },
    {
      new: true,
    }
  );
  return res.status(200).json({
    withdrawalRequests: adminUpdated.withdrawalRequests,
    message: "Accepted",
  });
});

module.exports = router;

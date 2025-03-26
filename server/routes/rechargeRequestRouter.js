const AdminModel = require("../models/AdminModel");
const UsersModel = require("../models/UsersModel");

const router = require("express").Router();

router.post("/recharge", async (req, res) => {
  const { userId, selectedUpi, amount, transactionId } = req.body;

  try {
    const admin = await AdminModel.findOne({
      email: "spking222005@gmail.com",
    });
    // Prevent from enter repeted same transaction Id
    if (
      admin.acceptedRechargeRequests.some(
        (request) => request.transactionId == transactionId
      )
    )
      return res.status(309).json({ message: "Transaction already completed" });

    await AdminModel.findOneAndUpdate(
      { email: "spking222005@gmail.com" },
      {
        $push: {
          rechargeRequests: { userId, selectedUpi, amount, transactionId },
        },
      }
    );
    await UsersModel.findOneAndUpdate(
      { userId },
      {
        $push: {
          rechargeRequests: {
            selectedUpi,
            amount,
            transactionId,
            status: "Pending",
          },
        },
      }
    );
    res.status(200).json({ message: "Added" });
  } catch (error) {
    res.status(400).json({ message: "Try Again" });
  }
});

router.get("/getAdminRechargeRequests", async (req, res) => {
  try {
    const getRechargeRequests = await AdminModel.findOne(
      { email: "spking222005@gmail.com" },
      { rechargeRequests: 1, _id: 0 }
    );

    return res
      .status(200)
      .json({ rechargeRequestDatas: getRechargeRequests.rechargeRequests });
  } catch (error) {
    res.status(400).json({ message: "Error to get data" });
  }
});

router.put("/success-recharge-request", async (req, res) => {
  const { userId, transactionId } = req.body;

  const user = await UsersModel.findOne({
    userId,
    "rechargeRequests.transactionId": transactionId,
  });

  if (!user) return res.status(404).json({ message: "User Not Found" });
  const recharge = user.rechargeRequests.find(
    (req) => req.transactionId === transactionId
  );
  if (!recharge)
    return res.status(404).json({ message: "Transaction Not Found" });

  await UsersModel.updateOne(
    {
      userId,
      "rechargeRequests.transactionId": transactionId,
    },
    {
      $set: {
        "rechargeRequests.$.status": "Success",
      },
      $inc: { rechargedBalance: parseInt(recharge.amount) },
    }
  );

  // Referrer commission added
  const calculateCommission = Math.floor(
    (parseInt(recharge.amount) / 100) * 30
  );

  await UsersModel.updateOne(
    { userId: user.referrer },
    {
      $inc: {
        commission: calculateCommission,
        rechargedBalance: calculateCommission,
      },
    }
  );

  const adminUpdated = await AdminModel.findOneAndUpdate(
    { email: "spking222005@gmail.com" },
    {
      $pull: { rechargeRequests: { transactionId } }, // Remove the request from rechargeRequests
      $push: { acceptedRechargeRequests: { userId, transactionId } }, // Add to acceptedRechargeRequests
    },
    {
      new: true,
    }
  );
  return res.status(200).json({
    rechargeRequests: adminUpdated.rechargeRequests,
    message: "Accepted",
  });
});

router.put("/rejected-recharge-request", async (req, res) => {
  const { userId, transactionId } = req.body;

  const user = await UsersModel.findOne({
    userId,
    "rechargeRequests.transactionId": transactionId,
  });
  if (!user) return res.status(404).json({ message: "User Not Found" });
  const recharge = user.rechargeRequests.find(
    (req) => req.transactionId === transactionId
  );
  if (!recharge)
    return res.status(404).json({ message: "Transaction Not Found" });

  await UsersModel.updateOne(
    {
      userId,
      "rechargeRequests.transactionId": transactionId,
    },
    {
      $set: {
        "rechargeRequests.$.status": "Rejected",
      },
    }
  );
  const adminUpdated = await AdminModel.findOneAndUpdate(
    { email: "spking222005@gmail.com" },
    {
      $pull: { rechargeRequests: { transactionId } }, // Remove the request from rechargeRequests
      $push: { rejectedRechargeRequests: { userId, transactionId } }, // Add to acceptedRechargeRequests
    },
    {
      new: true,
    }
  );
  return res.status(200).json({
    rechargeRequests: adminUpdated.rechargeRequests,
    message: "Successfully Rejected",
  });
});

router.get("/getUserRechargeHistory", async (req, res) => {
  const userId = req.query.userId;

  const userRechargeHistory = await UsersModel.findOne(
    { userId },
    { rechargeRequests: 1, _id: 0 }
  );

  if (!userRechargeHistory)
    return res.status(404).json({ message: "User Not Found" });

  return res.status(200).json({
    message: "Data found",
    rechargeHistory: userRechargeHistory.rechargeRequests,
  });
});

module.exports = router;

const UsersModel = require("../models/UsersModel");

const router = require("express").Router();

router.post("/buy-plan", async (req, res) => {
  const { choosedPlanData, userId } = req.body;

  const user = await UsersModel.findOne({ userId });

  if (!user) return res.status(404).json({ message: "User Not Found" });
  if (
    (user.rechargedBalance == undefined && choosedPlanData.price != 0) ||
    user.rechargedBalance < choosedPlanData.price
  )
    return res
      .status(402)
      .json({ message: "Insufficient balance. Please add funds to continue." });
  if (
    choosedPlanData.price == 0 &&
    user.buyedPlans.some((plan) => plan.price == choosedPlanData.price)
  )
    return res.status(309).json({ message: "Free Plan can only buy one time" });

  try {
    if (user.rechargedBalance == undefined && choosedPlanData.price == 0) {
      await UsersModel.updateOne(
        { userId },
        {
          $push: { buyedPlans: choosedPlanData },
          $inc: {
            dailyClaim: choosedPlanData.profit,
            // rechargedBalance: -choosedPlanData.price,
          },
        }
      );
    } else {
      await UsersModel.updateOne(
        { userId, rechargedBalance: { $gte: choosedPlanData.price } },
        {
          $push: { buyedPlans: choosedPlanData },
          $inc: {
            dailyClaim: choosedPlanData.profit,
            rechargedBalance: -choosedPlanData.price,
          },
        }
      );
    }

    return res.status(200).json({
      message: `Plan buyed new profit is ${
        parseInt(user.dailyClaim || 0) + parseInt(choosedPlanData.profit)
      }`,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something Went Wrong" });
  }
});

module.exports = router;

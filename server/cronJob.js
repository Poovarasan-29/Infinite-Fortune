const cron = require("node-cron");
const axios = require("axios");
const connectDB = require("./connectDatabase");
const UsersModel = require("./models/UsersModel");
require("dotenv").config();

cron.schedule("10 14 * * *", async () => {
  await axios.get("https://infinite-fortune.onrender.com/");
});

connectDB();
cron.schedule("13 14 * * *", async () => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Fetch all users
    const users = await UsersModel.find();

    if (!users.length) {
      return res.status(200).send("No users to update.");
    }

    const bulkOps = [];

    users.forEach((user) => {
      let totalProfitToDeduct = 0;

      // Filter out expired plans and calculate total profit to deduct
      user.buyedPlans = user.buyedPlans.filter((plan) => {
        if (new Date(plan.createdAt) < oneMonthAgo) {
          totalProfitToDeduct += plan.profit;
          return false; // Remove expired plan
        }
        return true;
      });

      // Prepare the update object
      const updateObj = {
        $set: { isClaimedToday: false }, // Reset for all users
      };

      if (totalProfitToDeduct > 0) {
        updateObj.$set.buyedPlans = user.buyedPlans;
        updateObj.$inc = { dailyClaim: -totalProfitToDeduct };
      }

      // Add update operation
      bulkOps.push({
        updateOne: {
          filter: { _id: user._id },
          update: updateObj,
        },
      });
    });

    // Execute bulk update
    if (bulkOps.length > 0) {
      await UsersModel.bulkWrite(bulkOps);
      return res.status(200).send("User data refreshed successfully.");
    }
    res.status(200).send("User data refreshed successfully.");
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

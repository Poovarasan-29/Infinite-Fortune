const cron = require("node-cron");
const connectDB = require("./connectDatabase");
const UsersModel = require("./models/UsersModel");
require("dotenv").config();

connectDB();

cron.schedule("0 0 * * *", async () => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Find users who have old plans
    const users = await UsersModel.find({
      "buyedPlans.createdAt": { $lt: oneMonthAgo },
    });

    for (const user of users) {
      let totalProfitToDeduct = 0;

      // Filter out old plans and calculate total profit to deduct
      user.buyedPlans = user.buyedPlans.filter((plan) => {
        if (plan.createdAt < oneMonthAgo) {
          totalProfitToDeduct += plan.profit;
          return false; // Remove the plan
        }
        return true;
      });

      // Deduct total profit from dailyClaim (ensure it doesn't go negative)
      user.dailyClaim = Math.max(
        0,
        (user.dailyClaim || 0) - totalProfitToDeduct
      );

      await user.save();
    }

    // Reset `isClaimedToday` for all users
    await UsersModel.updateMany({}, { $set: { isClaimedToday: false } });

    console.log(
      "Expired plans removed, dailyClaim updated, and isClaimedToday reset."
    );
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

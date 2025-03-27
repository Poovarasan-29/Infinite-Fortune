// const cron = require("node-cron");
// const connectDB = require("./connectDatabase");
// const UsersModel = require("./models/UsersModel");
// require("dotenv").config();

// connectDB();

// cron.schedule("0 0 * * *", async () => {
//   try {
//     const oneMonthAgo = new Date();
//     oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

//     // Find users who have old plans
//     const users = await UsersModel.find({
//       "buyedPlans.createdAt": { $lt: oneMonthAgo },
//     });

//     for (const user of users) {
//       let totalProfitToDeduct = 0;

//       // Filter out old plans and calculate total profit to deduct
//       user.buyedPlans = user.buyedPlans.filter((plan) => {
//         if (plan.createdAt < oneMonthAgo) {
//           totalProfitToDeduct += plan.profit;
//           return false; // Remove the plan
//         }
//         return true;
//       });

//       // Deduct total profit from dailyClaim (ensure it doesn't go negative)
//       user.dailyClaim = Math.max(
//         0,
//         (user.dailyClaim || 0) - totalProfitToDeduct
//       );

//       await user.save();
//     }

//     // Reset `isClaimedToday` for all users
//     await UsersModel.updateMany({}, { $set: { isClaimedToday: false } });

//     console.log(
//       "Expired plans removed, dailyClaim updated, and isClaimedToday reset."
//     );
//   } catch (error) {
//     console.error("Error in cron job:", error);
//   }
// });



const cron = require("node-cron");
const connectDB = require("./connectDatabase");
const UsersModel = require("./models/UsersModel");
require("dotenv").config();

connectDB();

cron.schedule("20 10 * * *", async () => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Fetch only users with expired plans
    const users = await UsersModel.find({ "buyedPlans.createdAt": { $lt: oneMonthAgo } });

    if (!users.length) {
      console.log("No expired plans found.");
      return;
    }

    const bulkOps = users.map(user => {
      let totalProfitToDeduct = 0;

      // Remove expired plans and calculate profit to deduct
      user.buyedPlans = user.buyedPlans.filter(plan => {
        if (new Date(plan.createdAt) < oneMonthAgo) {
          totalProfitToDeduct += plan.profit;
          return false; // Remove expired plan
        }
        return true;
      });

      return {
        updateOne: {
          filter: { _id: user._id },
          update: {
            $set: {
              buyedPlans: user.buyedPlans,
              isClaimedToday: false
            },
            $inc: { dailyClaim: -totalProfitToDeduct }
          }
        }
      };
    });

    // Execute bulk update
    if (bulkOps.length > 0) {
      await UsersModel.bulkWrite(bulkOps);
    }

    console.log("Expired plans removed, dailyClaim updated, and isClaimedToday reset.");
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});

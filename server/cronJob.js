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

// Schedule to run daily at 10:20 AM
cron.schedule("0 0 * * *", async () => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Fetch all users
    const users = await UsersModel.find();

    if (!users.length) { 
      console.log("No users found.");
      return;
    }

    const bulkOps = [];

    users.forEach(user => {
      let totalProfitToDeduct = 0;

      // Filter out expired plans and calculate total profit to deduct
      user.buyedPlans = user.buyedPlans.filter(plan => {
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
          update: updateObj
        }
      });
    });

    // Execute bulk update
    if (bulkOps.length > 0) {
      await UsersModel.bulkWrite(bulkOps);
      console.log(`${users.length} users updated: isClaimedToday reset for all, dailyClaim adjusted for affected users.`);
    }

  } catch (error) {
    console.error("Error in cron job:", error);
  }
});


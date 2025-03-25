const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userId: { type: String, required: true, unique: true },
  rechargeRequests: [
    {
      amount: Number,
      transactionId: String,
      selectedUpi: String,
      status: String,
    },
  ],
  rechargedBalance: Number,
  buyedPlans: [
    {
      image: String,
      price: Number,
      profit: Number,
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  balance: Number,
  dailyClaim: Number,
  isClaimedToday: Boolean,
  withdrawalRequests: [
    {
      amount: Number,
      transferToUPI: String,
      transactionId: String,
      status: String,
    },
  ],
  commission: Number,
  referrer: String,
  withdrawalBalanace: Number,
  referrals: { type: Array, default: [] },
});

const UsersModel = mongoose.model("users", UsersSchema);
module.exports = UsersModel;

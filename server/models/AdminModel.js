const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: String,
  email: String,
  password: String,
  rechargeRequests: [
    {
      userId: String,
      amount: Number,
      transactionId: String,
      selectedUpi: String,
    },
  ],
  withdrawalRequests: [
    {
      userId: String,
      amount: Number,
      transferToUPI: String,
    },
  ],
  acceptedRechargeRequests: [{ userId: String, transactionId: String }],
  rejectedRechargeRequests: [{ userId: String, transactionId: String }],
  acceptedWithdrawalRequests: [
    {
      userId: String,
      amount: Number,
      transactionId: String,
      transferToUPI: String,
    },
  ],
});

const AdminModel = mongoose.model("admin", AdminSchema);
module.exports = AdminModel;

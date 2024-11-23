import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  balanceAmount: {
    type: Number,
    default: 0,
  },
  transactions: [
    {
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "order",
      },
      description: {
        type: String,
        default: null,
      },
      transactionDate: {
        type: Date,
      },
      transactionType: {
        type: String,
        enum: ["debited", "credited"],
      },
      transactionStatus: {
        type: String,
        enum: ["Pending", "Completed", "Failed"],
      },
      amount: {
        type: Number,
      },
    },
  ],
});

const Wallet = mongoose.model("Wallet", walletSchema);

export default Wallet;

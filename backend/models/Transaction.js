const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    checkout_date: {
      type: Date,
      default: Date.now,
    },
    due_date: {
      type: Date,
      required: true,
    },
    return_date: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["issued", "returned", "overdue", "reserved"],
      default: "issued",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);

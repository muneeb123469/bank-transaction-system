const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    entryType: {
      type: String,
      enum: ["DEBIT", "CREDIT"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Amount must be greater than 0"],
    },
    currency: {
      type: String,
      default: "PKR",
    },
    narration: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

ledgerSchema.index({ account: 1, createdAt: -1 });
ledgerSchema.index({ transaction: 1 });

ledgerSchema.pre("findOneAndUpdate", function () {
  throw new Error("Ledger entries cannot be modified");
});

ledgerSchema.pre("updateOne", function () {
  throw new Error("Ledger entries cannot be modified");
});

ledgerSchema.pre("updateMany", function () {
  throw new Error("Ledger entries cannot be modified");
});

ledgerSchema.pre("deleteOne", function () {
  throw new Error("Ledger entries cannot be deleted");
});

ledgerSchema.pre("deleteMany", function () {
  throw new Error("Ledger entries cannot be deleted");
});

module.exports = mongoose.model("Ledger", ledgerSchema);

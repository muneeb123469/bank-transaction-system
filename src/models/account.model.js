const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    accountType: {
      type: String,
      enum: ["saving", "current"],
      default: "saving",
    },
    currency: {
      type: String,
      default: "PKR",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

accountSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("Account", accountSchema);

const Account = require("../models/account.model");
const calculateBalance = require("../utils/calculateBalance");
const generateAccountNumber = () => {
  return "PK" + Date.now();
};

exports.createAccount = async (req, res) => {
  try {
    const { accountType } = req.body;

    const account = await Account.create({
      user: req.user._id,
      accountNumber: generateAccountNumber(),
      accountType: accountType || "saving",
      currency: "PKR",
    });

    res.status(201).json({
      message: "Account created successfully",
      account,
    });
  } catch (error) {
    console.error("Create account error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.getMyAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "Accounts fetched successfully",
      count: accounts.length,
      accounts,
    });
  } catch (error) {
    console.error("Get accounts error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.getBalance = async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await Account.findOne({
      _id: accountId,
      user: req.user._id,
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    const balance = await calculateBalance(accountId);

    res.status(200).json({
      message: "Balance fetched successfully",
      accountId: account._id,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      currency: account.currency,
      balance,
    });
  } catch (error) {
    console.error("Get balance error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const Transaction = require("../models/transaction.model");
const Account = require("../models/account.model");
const calculateBalance = require("../utils/calculateBalance");
const Ledger = require("../models/ledger.model");
const sendEmail = require("../services/email.service");

exports.createTransaction = async (req, res) => {
  try {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body || {};

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (fromAccount === toAccount) {
      return res.status(400).json({
        message: "Cannot transfer to the same account",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than zero",
      });
    }

    const existingTransaction = await Transaction.findOne({ idempotencyKey });

    if (existingTransaction) {
      return res.status(400).json({
        message: "Duplicate transaction request: idempotency key already used",
      });
    }

    const senderAccount = await Account.findById(fromAccount);
    const receiverAccount = await Account.findById(toAccount);

    if (!senderAccount) {
      return res.status(404).json({
        message: "Sender account not found",
      });
    }

    if (!receiverAccount) {
      return res.status(404).json({
        message: "Receiver account not found",
      });
    }

    if (senderAccount.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only send money from your own account",
      });
    }

    if (senderAccount.status !== "active") {
      return res.status(400).json({
        message: "Sender account is not active",
      });
    }

    if (receiverAccount.status !== "active") {
      return res.status(400).json({
        message: "Receiver account is not active",
      });
    }

    const senderBalance = await calculateBalance(senderAccount._id);

    if (senderBalance < amount) {
      await sendEmail({
        to: req.user.email,
        subject: "Transaction Failed",
        text: `Your transaction of PKR ${amount} failed due to insufficient balance.`,
        html: `<h2>Transaction Failed</h2><p>Your transaction of <strong>PKR ${amount}</strong> failed due to insufficient balance.</p>`,
      });

      return res.status(400).json({
        message: "Insufficient balance",
        availableBalance: senderBalance,
      });
    }

    const transaction = await Transaction.create({
      fromAccount,
      toAccount,
      amount,
      currency: "PKR",
      status: "PENDING",
      idempotencyKey,
      description: "Fund transfer initiated",
    });

    // DEBIT sender
    await Ledger.create({
      account: senderAccount._id,
      transaction: transaction._id,
      entryType: "DEBIT",
      amount,
      narration: "Transfer debit",
    });

    // CREDIT receiver
    await Ledger.create({
      account: receiverAccount._id,
      transaction: transaction._id,
      entryType: "CREDIT",
      amount,
      narration: "Transfer credit",
    });

    // Mark completed
    transaction.status = "COMPLETED";
    await transaction.save();
    await sendEmail({
      to: req.user.email,
      subject: "Transaction Successful",
      text: `Your transfer of PKR ${amount} was completed successfully.`,
      html: `<h2>Transaction Successful</h2><p>Your transfer of <strong>PKR ${amount}</strong> was completed successfully.</p>`,
    });
    res.status(201).json({
      message: "Transaction completed successfully",
      transaction,
    });
  } catch (error) {
    console.error("Create transaction error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

exports.createInitialFundsTransaction = async (req, res) => {
  try {
    const { toAccount, amount, idempotencyKey } = req.body || {};

    if (!toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        message: "toAccount, amount and idempotencyKey are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than zero",
      });
    }

    if (!req.user.systemUser) {
      return res.status(403).json({
        message: "Only system user can perform initial funding",
      });
    }

    // 🔹 Find system account
    const systemAccount = await Account.findOne({
      user: req.user._id,
    });

    if (!systemAccount) {
      return res.status(404).json({
        message: "System account not found",
      });
    }

    // 🔹 Find receiver account
    const receiverAccount = await Account.findById(toAccount);

    if (!receiverAccount) {
      return res.status(404).json({
        message: "Receiver account not found",
      });
    }
    const existingTransaction = await Transaction.findOne({ idempotencyKey });

    if (existingTransaction) {
      return res.status(400).json({
        message:
          "Duplicate initial funding request: idempotency key already used",
      });
    }

    // 🔹 Create transaction
    const transaction = await Transaction.create({
      fromAccount: systemAccount._id,
      toAccount,
      amount,
      currency: "PKR",
      status: "PENDING",
      idempotencyKey,
      description: "Initial funding",
    });

    // 🔹 Create DEBIT entry (system loses money)
    await Ledger.create({
      account: systemAccount._id,
      transaction: transaction._id,
      entryType: "DEBIT",
      amount,
      narration: "Initial funding debit",
    });

    // 🔹 Create CREDIT entry (user gains money)
    await Ledger.create({
      account: receiverAccount._id,
      transaction: transaction._id,
      entryType: "CREDIT",
      amount,
      narration: "Initial funding credit",
    });

    // 🔹 Mark transaction as completed
    transaction.status = "COMPLETED";
    await transaction.save();

    res.status(201).json({
      message: "Initial funding successful",
      transaction,
    });
  } catch (error) {
    console.error("Initial funding error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

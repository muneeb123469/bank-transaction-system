const Ledger = require("../models/ledger.model");

const calculateBalance = async (accountId) => {
  const entries = await Ledger.find({ account: accountId });

  let balance = 0;

  for (const entry of entries) {
    if (entry.entryType === "CREDIT") {
      balance += entry.amount;
    } else if (entry.entryType === "DEBIT") {
      balance -= entry.amount;
    }
  }

  return balance;
};

module.exports = calculateBalance;

const express = require("express");
const protect = require("../middleware/auth.middleware");
const {
  createAccount,
  getMyAccounts,
  getBalance,
} = require("../controllers/account.controller");

const router = express.Router();

router.post("/", protect, createAccount);
router.get("/", protect, getMyAccounts);
router.get("/:accountId/balance", protect, getBalance);

module.exports = router;

const express = require("express");
const protect = require("../middleware/auth.middleware");
const {
  createTransaction,
  createInitialFundsTransaction,
} = require("../controllers/transaction.controller");

const router = express.Router();

router.post("/", protect, createTransaction);
router.post("/system/initial-funds", protect, createInitialFundsTransaction);

module.exports = router;

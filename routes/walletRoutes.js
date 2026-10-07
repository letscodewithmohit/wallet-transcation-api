const express = require("express");

const {
    createWallet,depositMoney,transferMoney,getBalance,getTransactions,getSummary
} = require("../controllers/walletController");

const router = express.Router();

router.post("/", createWallet);
router.post("/deposit", depositMoney)
router.post("/transfer",transferMoney)
router.get('/balance',getBalance)
router.get("/transactions",getTransactions)
router.get("/summary", getSummary)
module.exports = router;
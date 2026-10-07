const express = require("express");

const {
    createWallet,depositMoney,transferMoney
} = require("../controllers/walletController");

const router = express.Router();

router.post("/", createWallet);
router.post("/deposit", depositMoney)
router.post("/transfer",transferMoney)
module.exports = router;
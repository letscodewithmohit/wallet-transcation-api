
const pool = require("../config/db");
const walletTransactionModel = require("../models/walletTransactionModel");
const walletModel = require("../models/walletModel");
const transferModel = require("../models/transferModel")

// to post in wallet

const createWallet = async (req,res) => {

    try{
        const { userId,currency } = req.body;

        if(!userId){
            return res.status(400).json({
                message : "userId is required",
            });
        }

        const existingWallet = await walletModel.getWalletByUserId(userId);

        if(existingWallet){
            return status(400).json({
               message : "User Already exist"
            });
        }

        const result = await walletModel.createWallet(
            userId, currency || "INR"
        );

        const wallet = await walletModel.getWalletById(result.insertId);
        return res.status(201).json({
            message : "wallet created successfully"
        });
    }catch(error){
        console.error("create wallet error", error);

        if(error.code === "ER_NO_REFERENCED_ROW_2"){
            return res.status(404).json({
                message : "user not found",
            })
        }

        return res.status(500).json({
            message : "Interval Server error"
        });
    }
};

const depositMoney = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const {
            walletId,
            amount,
            referenceId,
        } = req.body;

        if (!walletId || amount === undefined || !referenceId) {
            return res.status(400).json({
                message: "walletId, amount and referenceId are required",
            });
        }

        if (Number(amount) <= 0) {
            return res.status(400).json({
                message: "Amount must be greater than 0",
            });
        }

        await connection.beginTransaction();

        const wallet = await walletModel.getWalletForUpdate(
            walletId,
            connection
        );

        if (!wallet) {
            await connection.rollback();

            return res.status(404).json({
                message: "Wallet not found",
            });
        }


          console.log("Wallet status:", wallet.status);
        if (wallet.status.toUpperCase() !== "ACTIVE") {
            await connection.rollback();

            return res.status(400).json({
                message: "Wallet is not active",
            });
        }

        const balanceBefore = Number(wallet.balance);
        const depositAmount = Number(amount);
        const balanceAfter = balanceBefore + depositAmount;

        await walletModel.updateBalance(
            walletId,
            balanceAfter,
            connection
        );

        await walletTransactionModel.createTransaction(
            connection,
            {
                walletId,
                referenceId,
                type: "CREDIT",
                amount: depositAmount,
                balanceBefore,
                balanceAfter,
                description: "Wallet deposit",
            }
        );

        await connection.commit();

        return res.status(201).json({
            message: "Money deposited successfully",
            walletId,
            amount: depositAmount,
            balanceBefore,
            balanceAfter,
            referenceId,
        });

    } catch (error) {
        await connection.rollback();

        console.error("Deposit error:", error);

        return res.status(500).json({
            message: "Failed to deposit money",
        });

    } finally {
        connection.release();
    }
};

const transferMoney = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const {
            senderWalletId,
            receiverWalletId,
            amount,
            referenceId,
        } = req.body;

        // 1. Basic validation
        if (
            !senderWalletId ||
            !receiverWalletId ||
            amount === undefined ||
            !referenceId
        ) {
            return res.status(400).json({
                message:
                    "senderWalletId, receiverWalletId, amount and referenceId are required",
            });
        }

        if (Number(amount) <= 0) {
            return res.status(400).json({
                message: "Amount must be greater than 0",
            });
        }

        if (senderWalletId === receiverWalletId) {
            return res.status(400).json({
                message: "Sender and receiver wallets must be different",
            });
        }

        const transferAmount = Number(amount);

        await connection.beginTransaction();

        // 2. Check duplicate referenceId
        const existingTransfer =
            await transferModel.getTransferByReferenceId(
                referenceId,
                connection
            );

        if (existingTransfer) {
            await connection.rollback();

            return res.status(409).json({
                message: "Duplicate referenceId",
                transfer: existingTransfer,
            });
        }

       
        let senderWallet;
        let receiverWallet;

        if (Number(senderWalletId) < Number(receiverWalletId)) {
            const firstWallet =
                await walletModel.getWalletForUpdate(
                    senderWalletId,
                    connection
                );

            const secondWallet =
                await walletModel.getWalletForUpdate(
                    receiverWalletId,
                    connection
                );

            senderWallet = firstWallet;
            receiverWallet = secondWallet;
        } else {
            const firstWallet =
                await walletModel.getWalletForUpdate(
                    receiverWalletId,
                    connection
                );

            const secondWallet =
                await walletModel.getWalletForUpdate(
                    senderWalletId,
                    connection
                );

            receiverWallet = firstWallet;
            senderWallet = secondWallet;
        }

      
        if (!senderWallet) {
            await connection.rollback();

            return res.status(404).json({
                message: "Sender wallet not found",
            });
        }

        if (!receiverWallet) {
            await connection.rollback();

            return res.status(404).json({
                message: "Receiver wallet not found",
            });
        }

        
        if (senderWallet.status.toUpperCase() !== "ACTIVE") {
            await connection.rollback();

            return res.status(400).json({
                message: "Sender wallet is not active",
            });
        }

        if (receiverWallet.status.toUpperCase() !== "ACTIVE") {
            await connection.rollback();

            return res.status(400).json({
                message: "Receiver wallet is not active",
            });
        }

        // 6. Check different users
        if (senderWallet.userId === receiverWallet.userId) {
            await connection.rollback();

            return res.status(400).json({
                message: "Sender and receiver must be different users",
            });
        }

       
        const senderBalanceBefore =
            Number(senderWallet.balance);

        const receiverBalanceBefore =
            Number(receiverWallet.balance);

        if (senderBalanceBefore < transferAmount) {
            await connection.rollback();

            return res.status(422).json({
                message: "Insufficient wallet balance",
            });
        }

        
        const senderBalanceAfter =
            senderBalanceBefore - transferAmount;

        const receiverBalanceAfter =
            receiverBalanceBefore + transferAmount;

        // 9. Update sender
        await walletModel.updateBalance(
            senderWallet.id,
            senderBalanceAfter,
            connection
        );

        // 10. Update receiver
        await walletModel.updateBalance(
            receiverWallet.id,
            receiverBalanceAfter,
            connection
        );

     
        await walletTransactionModel.createTransaction(
            connection,
            {
                walletId: senderWallet.id,
                referenceId,
                type: "DEBIT",
                amount: transferAmount,
                balanceBefore: senderBalanceBefore,
                balanceAfter: senderBalanceAfter,
                description: "Money transferred",
            }
        );

        // 12. Create receiver CREDIT transaction
        await walletTransactionModel.createTransaction(
            connection,
            {
                walletId: receiverWallet.id,
                referenceId,
                type: "CREDIT",
                amount: transferAmount,
                balanceBefore: receiverBalanceBefore,
                balanceAfter: receiverBalanceAfter,
                description: "Money received",
            }
        );

        // 13. Create transfer record
        await transferModel.createTransfer(
            connection,
            {
                referenceId,
                senderWalletId: senderWallet.id,
                receiverWalletId: receiverWallet.id,
                amount: transferAmount,
            }
        );

        // 14. Commit everything
        await connection.commit();

        return res.status(201).json({
            message: "Transfer successful",
            referenceId,
            amount: transferAmount,
            sender: {
                walletId: senderWallet.id,
                balanceBefore: senderBalanceBefore,
                balanceAfter: senderBalanceAfter,
            },
            receiver: {
                walletId: receiverWallet.id,
                balanceBefore: receiverBalanceBefore,
                balanceAfter: receiverBalanceAfter,
            },
        });

    } catch (error) {
        await connection.rollback();

        console.error("Transfer error:", error);

        // Duplicate referenceId
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Duplicate referenceId",
            });
        }

        return res.status(500).json({
            message: "Transfer failed",
        });

    } finally {
        connection.release();
    }
};
module.exports = {
    createWallet,
    depositMoney,
    transferMoney
}
const { Connection } = require("mysql2");

const createTransaction = async (Connection,{walletId, refernecId, type,amount, balanceBefore, balanceAfter, description})=>{

    const [result] = await Connection.query(
        `INSERT INTO wallet_transactions(walletId, refernecId, type,amount, balanceBefore, balanceAfter, description) VALUES (?,?,?,?,?,?,?)`,[walletId, refernecId, type,amount, balanceBefore, balanceAfter, description]
    );
    return result;
};

module.exports = {
    createTransaction
}
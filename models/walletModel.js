const pool = require("../config/db");

const createWallet = async (userId, currency = "INR") =>{
    const [result] = await pool.query(`INSERT INTO wallets (userId, currency) values (?, ?)`,
        [userId,currency]
    );
    return result;
};

const getWalletById = async (walletId) => {
    const [rows] = await pool.query(
        `SELECT * FROM wallets where id = ?`, [walletId]
    );
    return rows[0];
};


const getWalletByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT * FROM wallets where userId = ?`, [userId]
    );
    return rows[0];
};



const getWalletForUpdate = async (walletId,connection) => {
    const [rows] = await connection.query(
        `SELECT * FROM wallets where id = ? FOR UPDTAE`, [walletId]
    );
    return rows[0];
};



const updateBalance = async (walletId,balance, connection) => {
      const [result] = await connection.query(`UPDATE wallets SET balance = ? where id = ?`,
        [balance,walletId]
    );
    return result;
   
};

module.exports = {
    createWallet,
    getWalletById,  
    getWalletByUserId,
    getWalletForUpdate,
    updateBalance};



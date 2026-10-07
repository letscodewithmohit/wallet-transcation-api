const { Connection } = require("mysql2");

const createTransaction = async (Connection,{walletId, referenceId, type,amount, balanceBefore, balanceAfter, description})=>{

    const [result] = await Connection.query(
        `INSERT INTO wallet_transactions(walletId, referenceId, type,amount, balanceBefore, balanceAfter, description) VALUES (?,?,?,?,?,?,?)`,[walletId, referenceId, type,amount, balanceBefore, balanceAfter, description]
    );
    return result;
};

const getTransactions = async (
    walletId,
    page,
    limit,
    type,
    fromDate,
    toDate
) => {
    const offset = (page - 1) * limit;

    let whereClause = `WHERE walletId = ?`;
    const params = [walletId];

    if (type) {
        whereClause += ` AND type = ?`;
        params.push(type);
    }

    if (fromDate) {
        whereClause += ` AND DATE(createdAt) >= ?`;
        params.push(fromDate);
    }

    if (toDate) {
        whereClause += ` AND DATE(createdAt) <= ?`;
        params.push(toDate);
    }

    const [rows] = await pool.query(
        `SELECT
            id,
            walletId,
            referenceId,
            type,
            amount,
            balanceBefore,
            balanceAfter,
            description,
            createdAt
         FROM wallet_transactions
         ${whereClause}
         ORDER BY createdAt DESC
         LIMIT ? OFFSET ?`,
        [...params, Number(limit), Number(offset)]
    );

    const [countRows] = await pool.query(
        `SELECT COUNT(*) AS total
         FROM wallet_transactions
         ${whereClause}`,
        params
    );

    return {
        transactions: rows,
        total: countRows[0].total,
    };
};


module.exports = {
    createTransaction,getTransactions
}
const { Connection } = require("mysql2");

const createTransfer = async (Connection,{refernecId,senderWalletId, receiverwalletId,amount})=>{

    const [result] = await Connection.query(
        `INSERT INTO transfers(refernecId,senderWalletId, receiverwalletId,amount,status) VALUES (?,?,?,?,'COMPLETED')`,[refernecId,senderWalletId, receiverwalletId,amount]
    );
    return result;
};


const getTransferByReferenceId = async (refernecId,Connection)=>{

    const [rows] = await Connection.query(
        `SELECT * FROM transfers where referenceId = ?`,[refernecId]
    );
    return rows[0];
};


module.exports = {
    createTransfer,getTransferByReferenceId
}
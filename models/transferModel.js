const { Connection } = require("mysql2");

const createTransfer = async (Connection,{referenceId,senderWalletId, receiverWalletId,amount})=>{

    const [result] = await Connection.query(
        `INSERT INTO transfers(referenceId,senderWalletId, receiverWalletId,amount,status) VALUES (?,?,?,?,'COMPLETED')`,[referenceId,senderWalletId, receiverWalletId,amount]
    );
    return result;
};


const getTransferByReferenceId = async (referenceId,Connection)=>{

    const [rows] = await Connection.query(
        `SELECT * FROM transfers where referenceId = ?`,[referenceId]
    );
    return rows[0];
};  


module.exports = {
    createTransfer,getTransferByReferenceId
}
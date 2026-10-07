# Wallet Transaction API

A simple Node.js and Express API for managing wallets, deposits, transfers and transaction history.

## Tech Stack

* Node.js
* Express.js
* MySQL
* mysql2

## Features

* Create wallet
* Add money
* Transfer money between wallets
* Check wallet balance
* Transaction history with pagination
* Transaction filters
* Wallet summary
* Database transactions for transfers
* Duplicate reference ID handling
* Wallet locking for concurrent transfers

## Project Structure

```text
backend/
├── config/
├── controllers/
├── models/
├── routes/
├── database/
│   └── schema.sql
├── .env.example
├── .gitignore
├── package.json
└── server.js
```

## Setup

Clone the repository and install dependencies:

```bash
npm install
```

Create a MySQL database:

```sql
CREATE DATABASE machine_test;
```

Run the SQL from:

```text
database/schema.sql
```

Create a `.env` file:

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=machine_test
DB_PORT=3306
PORT=5000
```

Start the server:

```bash
npm start
```

The API runs on:

```text
http://localhost:5000
```

## APIs

| Method | Endpoint                                          | Purpose            |
| ------ | ------------------------------------------------- | ------------------ |
| POST   | `/wallet`                                         | Create wallet      |
| POST   | `/wallet/deposit`                                 | Add money          |
| POST   | `/wallet/transfer`                                | Transfer money     |
| GET    | `/wallet/balance?walletId=1`                      | Get balance        |
| GET    | `/wallet/transactions?walletId=1&page=1&limit=10` | Get transactions   |
| GET    | `/wallet/summary?walletId=1`                      | Get wallet summary |

### Example: Deposit

```json
{
  "walletId": 1,
  "amount": 5000,
  "referenceId": "DEP-001"
}
```

### Example: Transfer

```json
{
  "senderWalletId": 1,
  "receiverWalletId": 2,
  "amount": 1000,
  "referenceId": "TRF-001"
}
```

## Transaction Handling

Transfers are handled inside a database transaction. Sender and receiver wallets are locked before updating the balances, and the transaction is rolled back if any step fails.

Duplicate `referenceId` values are also rejected to avoid processing the same request twice.

## Database

The project uses:

* `users`
* `wallets`
* `wallet_transactions`
* `transfers`

The database schema is available in `database/schema.sql`.

## Testing

The APIs can be tested using Postman.

Make sure MySQL is running before starting the server.

## Note

The actual `.env` file is not included in the repository. Use `.env.example` to create your local configuration.

## Author

Manmohan Choudhary

GitHub: https://github.com/letscodewithmohit

LinkedIn: https://www.linkedin.com/in/manmohan-choudhary01/

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const walletRoutes = require("./routes/walletRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/wallet", walletRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "API is running",
    });
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
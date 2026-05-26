// main entry point - this is where the server starts
// i learned this from express docs and some youtube tutorials

// fix: college/ISP DNS blocks mongodb SRV lookup, so we force Google's DNS
// found this solution on stackoverflow after hours of debugging lol
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const ticketRoutes = require("./routes/ticketRoutes");

const app = express();


app.use(cors());
app.use(express.json());

app.use("/tickets", ticketRoutes);

app.get("/", (req, res) => {
  res.json({ message: "DeskFlow API is running!" });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed:", err.message);
    process.exit(1);
  });

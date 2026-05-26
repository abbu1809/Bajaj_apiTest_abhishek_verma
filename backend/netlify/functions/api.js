const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const serverless = require("serverless-http");
require("dotenv").config();

const ticketRoutes = require("../../routes/ticketRoutes");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api/tickets", ticketRoutes);
app.use("/tickets", ticketRoutes);

app.get("/", (req, res) => {
  res.json({ message: "DeskFlow API is running!" });
});

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

const handler = serverless(app);

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDB();
  return handler(event, context);
};

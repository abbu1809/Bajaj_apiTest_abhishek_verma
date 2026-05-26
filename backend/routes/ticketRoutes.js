const express = require("express");
const router = express.Router();

const {
  createTicket,
  getTickets,
  updateTicket,
  deleteTicket,
  getStats,
} = require("../controllers/ticketController");

router.get("/stats", getStats);
router.post("/", createTicket);
router.get("/", getTickets);
router.patch("/:id", updateTicket);
router.delete("/:id", deleteTicket);

module.exports = router;

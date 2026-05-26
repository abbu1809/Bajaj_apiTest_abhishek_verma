// routes file - maps each url to its controller function
// keeping routes separate from logic is good practice

const express = require("express");
const router = express.Router();

const {
  createTicket,
  getTickets,
  updateTicket,
  deleteTicket,
  getStats,
} = require("../controllers/ticketController");

// IMPORTANT: /stats route must come BEFORE /:id routes
// otherwise express will try to match "stats" as an id and fail
router.get("/stats", getStats);

router.post("/", createTicket);
router.get("/", getTickets);
router.patch("/:id", updateTicket);
router.delete("/:id", deleteTicket);

module.exports = router;

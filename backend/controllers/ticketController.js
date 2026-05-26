const Ticket = require("../models/Ticket");
const { addDerivedFields, isValidTransition } = require("../utils/helpers");

async function createTicket(req, res) {
  try {
    const { subject, description, customerEmail, priority } = req.body;

    if (!subject || !description || !customerEmail || !priority) {
      return res.status(400).json({
        error: "Missing required fields: subject, description, customerEmail, priority",
      });
    }

    const newTicket = new Ticket({ subject, description, customerEmail, priority });
    const savedTicket = await newTicket.save();

    res.status(201).json(addDerivedFields(savedTicket));
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(", ") });
    }
    res.status(500).json({ error: "Something went wrong on the server" });
  }
}

async function getTickets(req, res) {
  try {
    const { status, priority, breached } = req.query;
    const validStatuses = ["open", "in_progress", "resolved", "closed"];
    const validPriorities = ["low", "medium", "high", "urgent"];

    let filter = {};

    if (status) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status filter value" });
      }
      filter.status = status;
    }

    if (priority) {
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({ error: "Invalid priority filter value" });
      }
      filter.priority = priority;
    }

    const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
    let result = tickets.map((t) => addDerivedFields(t));

    if (breached === "true") {
      result = result.filter((t) => t.slaBreached === true);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch tickets" });
  }
}

async function updateTicket(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status field is required" });
    }

    const validStatuses = ["open", "in_progress", "resolved", "closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    if (!isValidTransition(ticket.status, status)) {
      return res.status(400).json({
        error: `Transition from '${ticket.status}' to '${status}' is not allowed`,
      });
    }

    if (status === "resolved") {
      ticket.resolvedAt = new Date();
    }

    if (ticket.status === "resolved" && status !== "resolved") {
      ticket.resolvedAt = null;
    }

    ticket.status = status;
    await ticket.save();

    res.json(addDerivedFields(ticket));
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid ticket ID format" });
    }
    res.status(500).json({ error: "Could not update ticket" });
  }
}

async function deleteTicket(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Ticket.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json({ message: "Ticket deleted successfully" });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ error: "Invalid ticket ID format" });
    }
    res.status(500).json({ error: "Could not delete ticket" });
  }
}

async function getStats(req, res) {
  try {
    const allTickets = await Ticket.find();

    const statusCounts = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    const priorityCounts = { low: 0, medium: 0, high: 0, urgent: 0 };
    let breachedOpenCount = 0;

    allTickets.forEach((ticket) => {
      if (statusCounts[ticket.status] !== undefined) {
        statusCounts[ticket.status]++;
      }
      if (priorityCounts[ticket.priority] !== undefined) {
        priorityCounts[ticket.priority]++;
      }
      const withDerived = addDerivedFields(ticket);
      if (
        withDerived.slaBreached &&
        (ticket.status === "open" || ticket.status === "in_progress")
      ) {
        breachedOpenCount++;
      }
    });

    res.json({
      byStatus: statusCounts,
      byPriority: priorityCounts,
      breachedOpen: breachedOpenCount,
    });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch stats" });
  }
}

module.exports = { createTicket, getTickets, updateTicket, deleteTicket, getStats };

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const serverless = require("serverless-http");

const MONGO_URI = process.env.MONGO_URI;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const ticketSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
      trim: true,
      lowercase: true,
    },
    priority: {
      type: String,
      required: [true, "Priority is required"],
      enum: {
        values: ["low", "medium", "high", "urgent"],
        message: "Priority must be one of: low, medium, high, urgent",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["open", "in_progress", "resolved", "closed"],
        message: "Status must be one of: open, in_progress, resolved, closed",
      },
      default: "open",
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Ticket =
  mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);

const SLA_TARGETS = { urgent: 60, high: 240, medium: 1440, low: 4320 };

const VALID_TRANSITIONS = {
  open: ["in_progress"],
  in_progress: ["open", "resolved"],
  resolved: ["in_progress", "closed"],
  closed: [],
};

function addDerivedFields(ticket) {
  const now = new Date();
  const endTime =
    ticket.status === "resolved" || ticket.status === "closed"
      ? ticket.resolvedAt || now
      : now;
  const ageMinutes = Math.floor(
    (endTime - new Date(ticket.createdAt)) / 1000 / 60
  );
  const slaBreached = ageMinutes > SLA_TARGETS[ticket.priority];
  return { ...ticket.toObject(), ageMinutes, slaBreached };
}

function isValidTransition(current, next) {
  return (VALID_TRANSITIONS[current] || []).includes(next);
}

const app = express();

app.use((req, res, next) => {
  res.set(CORS_HEADERS);
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "DeskFlow API is running!" });
});

app.get("/tickets/stats", async (req, res) => {
  try {
    const all = await Ticket.find();
    const byStatus = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    const byPriority = { low: 0, medium: 0, high: 0, urgent: 0 };
    let breachedOpen = 0;
    all.forEach((t) => {
      if (byStatus[t.status] !== undefined) byStatus[t.status]++;
      if (byPriority[t.priority] !== undefined) byPriority[t.priority]++;
      const d = addDerivedFields(t);
      if (d.slaBreached && (t.status === "open" || t.status === "in_progress")) {
        breachedOpen++;
      }
    });
    res.json({ byStatus, byPriority, breachedOpen });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch stats" });
  }
});

app.post("/tickets", async (req, res) => {
  try {
    const { subject, description, customerEmail, priority } = req.body;
    if (!subject || !description || !customerEmail || !priority) {
      return res.status(400).json({
        error:
          "Missing required fields: subject, description, customerEmail, priority",
      });
    }
    const ticket = new Ticket({ subject, description, customerEmail, priority });
    const saved = await ticket.save();
    res.status(201).json(addDerivedFields(saved));
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(", ") });
    }
    res.status(500).json({ error: "Something went wrong on the server" });
  }
});

app.get("/tickets", async (req, res) => {
  try {
    const { status, priority, breached } = req.query;
    const validStatuses = ["open", "in_progress", "resolved", "closed"];
    const validPriorities = ["low", "medium", "high", "urgent"];
    const filter = {};
    if (status) {
      if (!validStatuses.includes(status))
        return res.status(400).json({ error: "Invalid status filter value" });
      filter.status = status;
    }
    if (priority) {
      if (!validPriorities.includes(priority))
        return res.status(400).json({ error: "Invalid priority filter value" });
      filter.priority = priority;
    }
    const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
    let result = tickets.map(addDerivedFields);
    if (breached === "true") result = result.filter((t) => t.slaBreached);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch tickets" });
  }
});

app.patch("/tickets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status)
      return res.status(400).json({ error: "Status field is required" });
    const validStatuses = ["open", "in_progress", "resolved", "closed"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ error: "Invalid status value" });
    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    if (!isValidTransition(ticket.status, status)) {
      return res.status(400).json({
        error: `Transition from '${ticket.status}' to '${status}' is not allowed`,
      });
    }
    if (status === "resolved") ticket.resolvedAt = new Date();
    if (ticket.status === "resolved" && status !== "resolved")
      ticket.resolvedAt = null;
    ticket.status = status;
    await ticket.save();
    res.json(addDerivedFields(ticket));
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).json({ error: "Invalid ticket ID format" });
    res.status(500).json({ error: "Could not update ticket" });
  }
});

app.delete("/tickets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Ticket.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Ticket not found" });
    res.json({ message: "Ticket deleted successfully" });
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).json({ error: "Invalid ticket ID format" });
    res.status(500).json({ error: "Could not delete ticket" });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(MONGO_URI);
  isConnected = true;
}

const handler = serverless(app);

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  await connectDB();
  const result = await handler(event, context);

  result.headers = { ...result.headers, ...CORS_HEADERS };
  return result;
};

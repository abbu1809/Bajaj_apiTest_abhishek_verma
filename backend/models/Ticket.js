// ticket model - defines the structure of a ticket in mongodb
// using mongoose to make things easier with the schema

const mongoose = require("mongoose");

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
      // basic email validation using regex
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
  {

    timestamps: true,
  }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;

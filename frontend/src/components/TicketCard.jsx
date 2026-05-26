import React, { useState } from "react";
import "./TicketCard.css";

function formatAge(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

const NEXT_ACTIONS = {
  open: [{ label: "Move to In Progress", status: "in_progress" }],
  in_progress: [
    { label: "Move Back to Open", status: "open" },
    { label: "Move to Resolved", status: "resolved" },
  ],
  resolved: [
    { label: "Move Back to In Progress", status: "in_progress" },
    { label: "Close Ticket", status: "closed" },
  ],
  closed: [],
};

function TicketCard({ ticket, onMove, onDelete, onDragStart }) {
  const [moving, setMoving] = useState(false);
  const [moveError, setMoveError] = useState("");

  const actions = NEXT_ACTIONS[ticket.status] || [];

  async function handleMove(newStatus) {
    setMoving(true);
    setMoveError("");
    try {
      await onMove(ticket._id, newStatus);
    } catch (err) {
      setMoveError(err.message);
    } finally {
      setMoving(false);
    }
  }

  async function handleDelete() {
    if (window.confirm("Are you sure you want to delete this ticket?")) {
      try {
        await onDelete(ticket._id);
      } catch (err) {
        alert(err.message);
      }
    }
  }

  function handleDragStart(e) {
    e.dataTransfer.setData("ticketId", ticket._id);
    e.dataTransfer.setData("currentStatus", ticket.status);
    e.dataTransfer.effectAllowed = "move";
    if (onDragStart) onDragStart(ticket._id);
  }

  function showSnapError(message) {
    setMoveError(message);
    setTimeout(() => setMoveError(""), 2500);
  }

  return (
    <div
      className={`ticket-card ${ticket.slaBreached ? "sla-breached" : ""} ${moveError ? "snap-back" : ""}`}
      draggable="true"
      onDragStart={handleDragStart}
      data-ticket-id={ticket._id}
      data-error-setter="true"
    >
      {ticket.slaBreached && (
        <div className="breach-banner">⚠ SLA Breached</div>
      )}

      <div className="card-header">
        <span className="card-subject">{ticket.subject}</span>
        <span className={`priority-badge priority-${ticket.priority}`}>
          {ticket.priority}
        </span>
      </div>

      <div className="card-age">Age: {formatAge(ticket.ageMinutes)}</div>
      <div className="card-email">{ticket.customerEmail}</div>

      {actions.length > 0 && (
        <div className="card-actions">
          {actions.map((action) => (
            <button
              key={action.status}
              className="btn-move"
              onClick={() => handleMove(action.status)}
              disabled={moving}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {moveError && <div className="card-error">{moveError}</div>}

      <button className="btn-delete" onClick={handleDelete}>
        Delete
      </button>
    </div>
  );
}

export default TicketCard;

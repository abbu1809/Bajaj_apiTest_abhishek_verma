// TicketCard.jsx - shows a single ticket in the board column
// has priority badge, age, SLA breach indicator, and move buttons

import React, { useState } from "react";
import "./TicketCard.css";

// helper to format minutes into "Xh Ym" string
function formatAge(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

// what buttons to show per status
// only adjacent valid moves are shown - invalid ones are hidden
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
  closed: [], // closed tickets cant be moved anywhere
};

function TicketCard({ ticket, onMove, onDelete }) {
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

  return (
    <div className={`ticket-card ${ticket.slaBreached ? "sla-breached" : ""}`}>
      {/* SLA breach warning at top of card */}
      {ticket.slaBreached && (
        <div className="breach-banner">⚠ SLA Breached</div>
      )}

      {/* subject and priority badge */}
      <div className="card-header">
        <span className="card-subject">{ticket.subject}</span>
        <span className={`priority-badge priority-${ticket.priority}`}>
          {ticket.priority}
        </span>
      </div>

      {/* age of ticket */}
      <div className="card-age">Age: {formatAge(ticket.ageMinutes)}</div>

      {/* customer email in small text */}
      <div className="card-email">{ticket.customerEmail}</div>

      {/* action buttons - only shows allowed transitions */}
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

      {/* show error if a move failed */}
      {moveError && <div className="card-error">{moveError}</div>}

      {/* delete button */}
      <button className="btn-delete" onClick={handleDelete}>
        Delete
      </button>
    </div>
  );
}

export default TicketCard;

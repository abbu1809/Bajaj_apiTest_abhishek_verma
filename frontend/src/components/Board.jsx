// Board.jsx - the main 4-column board view
// each column = one status, shows its tickets

import React from "react";
import TicketCard from "./TicketCard";
import "./Board.css";

// column definitions - order matters here (left to right)
const COLUMNS = [
  { id: "open", label: "Open" },
  { id: "in_progress", label: "In Progress" },
  { id: "resolved", label: "Resolved" },
  { id: "closed", label: "Closed" },
];

function Board({ tickets, onMove, onDelete }) {
  return (
    <div className="board">
      {COLUMNS.map((col) => {
        // filter tickets that belong to this column
        const colTickets = tickets.filter((t) => t.status === col.id);

        return (
          <div key={col.id} className="board-column">
            {/* column header with count */}
            <div className="column-header">
              <span className="column-title">{col.label}</span>
              <span className="column-count">{colTickets.length}</span>
            </div>

            {/* list of ticket cards */}
            <div className="column-body">
              {colTickets.length === 0 ? (
                <div className="empty-column">No tickets here</div>
              ) : (
                colTickets.map((ticket) => (
                  <TicketCard
                    key={ticket._id}
                    ticket={ticket}
                    onMove={onMove}
                    onDelete={onDelete}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Board;

import React, { useState, useRef } from "react";
import TicketCard from "./TicketCard";
import "./Board.css";

const COLUMNS = [
  { id: "open", label: "Open" },
  { id: "in_progress", label: "In Progress" },
  { id: "resolved", label: "Resolved" },
  { id: "closed", label: "Closed" },
];

const VALID_TRANSITIONS = {
  open: ["in_progress"],
  in_progress: ["open", "resolved"],
  resolved: ["in_progress", "closed"],
  closed: [],
};

function Board({ tickets, onMove, onDelete }) {
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [dropError, setDropError] = useState({ colId: null, message: "" });
  const draggedTicketId = useRef(null);

  function handleDragOver(e, colId) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(colId);
  }

  function handleDragLeave(colId) {
    if (dragOverColumn === colId) {
      setDragOverColumn(null);
    }
  }

  function clearDropError() {
    setTimeout(() => {
      setDropError({ colId: null, message: "" });
    }, 2500);
  }

  async function handleDrop(e, targetStatus) {
    e.preventDefault();
    setDragOverColumn(null);

    const ticketId = e.dataTransfer.getData("ticketId");
    const currentStatus = e.dataTransfer.getData("currentStatus");

    if (!ticketId || currentStatus === targetStatus) return;

    const allowedMoves = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowedMoves.includes(targetStatus)) {
      setDropError({
        colId: targetStatus,
        message: `Cannot move from '${currentStatus}' to '${targetStatus}'`,
      });
      clearDropError();
      return;
    }

    try {
      await onMove(ticketId, targetStatus);
    } catch (err) {
      setDropError({ colId: targetStatus, message: err.message });
      clearDropError();
    }
  }

  return (
    <div className="board">
      {COLUMNS.map((col) => {
        const colTickets = tickets.filter((t) => t.status === col.id);
        const isDragOver = dragOverColumn === col.id;
        const hasError = dropError.colId === col.id;

        return (
          <div
            key={col.id}
            className={`board-column ${isDragOver ? "drag-over" : ""} ${hasError ? "drop-error" : ""}`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={() => handleDragLeave(col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="column-header">
              <span className="column-title">{col.label}</span>
              <span className="column-count">{colTickets.length}</span>
            </div>

            {hasError && (
              <div className="column-drop-error">{dropError.message}</div>
            )}

            <div className="column-body">
              {colTickets.length === 0 ? (
                <div className="empty-column">
                  {isDragOver ? "Drop here" : "No tickets here"}
                </div>
              ) : (
                colTickets.map((ticket) => (
                  <TicketCard
                    key={ticket._id}
                    ticket={ticket}
                    onMove={onMove}
                    onDelete={onDelete}
                    onDragStart={(id) => { draggedTicketId.current = id; }}
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

import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import {
  fetchTickets,
  createTicket,
  updateTicketStatus,
  deleteTicket,
  fetchStats,
} from "./api";
import StatsStrip from "./components/StatsStrip";
import Board from "./components/Board";
import Filters from "./components/Filters";
import CreateTicketForm from "./components/CreateTicketForm";

function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ priority: "", breached: "" });
  const [showForm, setShowForm] = useState(false);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchTickets(filters);
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadStats = async () => {
    try {
      const data = await fetchStats();
      setStats(data);
    } catch (err) {
      console.error("Stats failed:", err.message);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    loadStats();
  }, []);

  const handleCreateTicket = async (formData) => {
    const newTicket = await createTicket(formData);
    setTickets((prev) => [newTicket, ...prev]);
    loadStats();
  };

  const handleMoveTicket = async (ticketId, newStatus) => {
    const updated = await updateTicketStatus(ticketId, newStatus);
    setTickets((prev) => prev.map((t) => (t._id === ticketId ? updated : t)));
    loadStats();
  };

  const handleDeleteTicket = async (ticketId) => {
    await deleteTicket(ticketId);
    setTickets((prev) => prev.filter((t) => t._id !== ticketId));
    loadStats();
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>DeskFlow</h1>
          <span className="header-subtitle">Support Ticket Triage Board</span>
        </div>
        <button className="btn-new-ticket" onClick={() => setShowForm(true)}>
          + New Ticket
        </button>
      </header>

      <main className="app-main">
        <StatsStrip stats={stats} />
        <Filters filters={filters} onChange={setFilters} />

        {loading ? (
          <div className="loading-message">Loading tickets...</div>
        ) : error ? (
          <div className="error-message">
            Error: {error}
            <button onClick={loadTickets} className="btn-retry">
              Retry
            </button>
          </div>
        ) : (
          <Board
            tickets={tickets}
            onMove={handleMoveTicket}
            onDelete={handleDeleteTicket}
          />
        )}
      </main>

      {showForm && (
        <CreateTicketForm
          onSubmit={handleCreateTicket}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

export default App;

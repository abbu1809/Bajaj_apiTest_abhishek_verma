// App.jsx - main app component
// this is where all the state lives and where we call the API

import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

import { fetchTickets, createTicket, updateTicketStatus, deleteTicket, fetchStats } from "./api";
import StatsStrip from "./components/StatsStrip";
import Board from "./components/Board";
import Filters from "./components/Filters";
import CreateTicketForm from "./components/CreateTicketForm";

function App() {
  // all the tickets currently shown on the board
  const [tickets, setTickets] = useState([]);

  // stats data for the strip at top
  const [stats, setStats] = useState(null);

  // loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filter state - what filters are currently active
  const [filters, setFilters] = useState({ priority: "", breached: "" });

  // whether the create-ticket modal is open or not
  const [showForm, setShowForm] = useState(false);

  // load tickets whenever filters change
  // using useCallback so we can call it from multiple places
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

  // load stats separately from tickets
  async function loadStats() {
    try {
      const data = await fetchStats();
      setStats(data);
    } catch (err) {
      // stats failing shouldn't break the whole page
      console.error("Could not load stats:", err.message);
    }
  }

  // fetch tickets whenever filters change
  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // fetch stats once on page load
  useEffect(() => {
    loadStats();
  }, []);

  // called when user creates a new ticket
  async function handleCreateTicket(formData) {
    const newTicket = await createTicket(formData);
    // add the new ticket to state directly so no reload needed
    setTickets((prev) => [newTicket, ...prev]);
    // refresh stats too
    loadStats();
  }

  // called when user clicks a "Move to ..." button on a card
  async function handleMoveTicket(ticketId, newStatus) {
    const updated = await updateTicketStatus(ticketId, newStatus);
    // replace the old ticket in state with the updated one
    setTickets((prev) =>
      prev.map((t) => (t._id === ticketId ? updated : t))
    );
    // also refresh stats since status counts changed
    loadStats();
  }

  // called when user clicks delete on a card
  async function handleDeleteTicket(ticketId) {
    await deleteTicket(ticketId);
    setTickets((prev) => prev.filter((t) => t._id !== ticketId));
    loadStats();
  }

  return (
    <div className="app">
      {/* top header bar */}
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
        {/* stats strip shows aggregate counts */}
        <StatsStrip stats={stats} />

        {/* filter controls */}
        <Filters filters={filters} onChange={setFilters} />

        {/* main board area */}
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

      {/* create ticket modal - only shown when button is clicked */}
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

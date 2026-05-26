
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// get all tickets - optional filters can be passed as an object
// e.g. { status: "open", priority: "high", breached: "true" }
export async function fetchTickets(filters = {}) {
  const params = new URLSearchParams();

  if (filters.status) params.append("status", filters.status);
  if (filters.priority) params.append("priority", filters.priority);
  if (filters.breached) params.append("breached", filters.breached);

  const url = `${BASE_URL}/tickets?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to fetch tickets");
  }

  return response.json();
}

// create a new ticket
export async function createTicket(data) {
  const response = await fetch(`${BASE_URL}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to create ticket");
  }

  return response.json();
}

// update ticket status (move it between columns)
export async function updateTicketStatus(ticketId, newStatus) {
  const response = await fetch(`${BASE_URL}/tickets/${ticketId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to update ticket");
  }

  return response.json();
}

// delete a ticket by id
export async function deleteTicket(ticketId) {
  const response = await fetch(`${BASE_URL}/tickets/${ticketId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to delete ticket");
  }

  return response.json();
}

// get aggregate stats for the stats strip
export async function fetchStats() {
  const response = await fetch(`${BASE_URL}/tickets/stats`);

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to fetch stats");
  }

  return response.json();
}

// helper functions that i use across the project
// keeping them separate so the controller file stays clean

// response time targets based on priority (in minutes)
// urgent = 1 hour, high = 4 hours, medium = 24 hours, low = 72 hours
const SLA_TARGETS = {
  urgent: 60,
  high: 240,
  medium: 1440,
  low: 4320,
};

// this function adds the derived fields to a ticket object
// ageMinutes and slaBreached are not stored in db, we calculate them each time
function addDerivedFields(ticket) {
  const now = new Date();

  // if resolved, age is from creation to resolution (not growing anymore)
  // if not resolved, age is from creation to right now
  const endTime =
    ticket.status === "resolved" || ticket.status === "closed"
      ? ticket.resolvedAt || now
      : now;

  const diffMs = endTime - new Date(ticket.createdAt);
  const ageMinutes = Math.floor(diffMs / 1000 / 60);

  // get the SLA target for this priority
  const targetMinutes = SLA_TARGETS[ticket.priority];

  // sla is breached if:
  // - ticket is not closed/resolved AND time exceeded target, OR
  // - ticket was resolved but took longer than target
  let slaBreached = false;

  if (ticket.status === "resolved" || ticket.status === "closed") {
    // already done - check if it was resolved in time
    slaBreached = ageMinutes > targetMinutes;
  } else {
    // still open - check if we're past the target
    slaBreached = ageMinutes > targetMinutes;
  }

  return {
    ...ticket.toObject(),
    ageMinutes,
    slaBreached,
  };
}

// define what status transitions are allowed
// open -> in_progress -> resolved -> closed (forward)
// can only go back one step (resolved -> in_progress, in_progress -> open)
const VALID_TRANSITIONS = {
  open: ["in_progress"],
  in_progress: ["open", "resolved"],
  resolved: ["in_progress", "closed"],
  closed: [],
};

// check if a given status change is allowed
function isValidTransition(currentStatus, newStatus) {
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
}

module.exports = { addDerivedFields, isValidTransition, SLA_TARGETS };

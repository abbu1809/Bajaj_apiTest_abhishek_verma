const SLA_TARGETS = {
  urgent: 60,
  high: 240,
  medium: 1440,
  low: 4320,
};

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

  const diffMs = endTime - new Date(ticket.createdAt);
  const ageMinutes = Math.floor(diffMs / 1000 / 60);

  const targetMinutes = SLA_TARGETS[ticket.priority];
  const slaBreached = ageMinutes > targetMinutes;

  return {
    ...ticket.toObject(),
    ageMinutes,
    slaBreached,
  };
}

function isValidTransition(currentStatus, newStatus) {
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  return allowed.includes(newStatus);
}

module.exports = { addDerivedFields, isValidTransition, SLA_TARGETS };

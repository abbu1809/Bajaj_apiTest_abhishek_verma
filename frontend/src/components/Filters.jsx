import React from "react";
import "./Filters.css";

function Filters({ filters, onChange }) {
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    onChange({
      ...filters,
      [name]: type === "checkbox" ? (checked ? "true" : "") : value,
    });
  }

  return (
    <div className="filters-bar">
      <span className="filters-label">Filters:</span>

      <div className="filter-group">
        <label htmlFor="filter-priority">Priority</label>
        <select
          id="filter-priority"
          name="priority"
          value={filters.priority}
          onChange={handleChange}
        >
          <option value="">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div className="filter-group filter-checkbox">
        <label htmlFor="filter-breached">
          <input
            id="filter-breached"
            name="breached"
            type="checkbox"
            checked={filters.breached === "true"}
            onChange={handleChange}
          />
          SLA Breached Only
        </label>
      </div>

      {(filters.priority || filters.breached) && (
        <button
          className="btn-clear-filters"
          onClick={() => onChange({ priority: "", breached: "" })}
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

export default Filters;

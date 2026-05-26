// CreateTicketForm.jsx - the form to create a new ticket
// shows as a modal when the user clicks "New Ticket"

import React, { useState } from "react";
import "./CreateTicketForm.css";

// initial blank form state - easier to reset after submit
const EMPTY_FORM = {
  subject: "",
  description: "",
  customerEmail: "",
  priority: "medium",
};

function CreateTicketForm({ onSubmit, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // update a single field in the form state
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // clear the error for this field as soon as user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  // simple client-side validation before sending to API
  function validate() {
    const newErrors = {};

    if (!form.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!form.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!form.customerEmail.trim()) {
      newErrors.customerEmail = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.customerEmail)) {
      newErrors.customerEmail = "Enter a valid email address";
    }

    if (!form.priority) {
      newErrors.priority = "Please select a priority";
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(form);
      // reset form on success
      setForm(EMPTY_FORM);
      onClose(); // close the modal
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    // clicking the backdrop closes the modal
    <div className="modal-backdrop" onClick={onClose}>
      {/* stop click from reaching backdrop */}
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Ticket</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* subject field */}
          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <input
              id="subject"
              name="subject"
              type="text"
              value={form.subject}
              onChange={handleChange}
              placeholder="Brief summary of the issue"
            />
            {errors.subject && (
              <span className="field-error">{errors.subject}</span>
            )}
          </div>

          {/* description field */}
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail"
            />
            {errors.description && (
              <span className="field-error">{errors.description}</span>
            )}
          </div>

          {/* email field */}
          <div className="form-group">
            <label htmlFor="customerEmail">Customer Email *</label>
            <input
              id="customerEmail"
              name="customerEmail"
              type="text"
              value={form.customerEmail}
              onChange={handleChange}
              placeholder="customer@example.com"
            />
            {errors.customerEmail && (
              <span className="field-error">{errors.customerEmail}</span>
            )}
          </div>

          {/* priority dropdown */}
          <div className="form-group">
            <label htmlFor="priority">Priority *</label>
            <select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              <option value="low">Low (72h SLA)</option>
              <option value="medium">Medium (24h SLA)</option>
              <option value="high">High (4h SLA)</option>
              <option value="urgent">Urgent (1h SLA)</option>
            </select>
            {errors.priority && (
              <span className="field-error">{errors.priority}</span>
            )}
          </div>

          {/* server-side error if API call fails */}
          {serverError && <div className="server-error">{serverError}</div>}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTicketForm;


import React, { useState } from "react";
import axios from "axios";
import "./AddEvent.css";

function AddEventForm({ onAdd }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({ name: "", date: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    let hasError = false;
    const newErrors = { name: "", date: "" };

    if (!name.trim()) {
      newErrors.name = "Please enter the Event title.";
      hasError = true;
    }

    if (!date) {
      newErrors.date = "Please select an Event date.";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.post(
        "https://cws-server.vercel.app/addEvent",
        { name, date },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // if (onAdd) onAdd(res.data);

      // 👇 Adjust here — make sure we send the *actual event object* only
      const newEvent = res.data.event || res.data; // handle both possible response shapes
      if (onAdd && newEvent) onAdd(newEvent);

      setName("");
      setDate("");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setError("Failed to add event.");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  return (
    <>
      {/* Button to open modal */}
      <button
          className="btn btn-sm custom-outline-btn"
            style={{  minWidth: 90 }}
        onClick={() => setShowModal(true)}
      >
        Add Event
      </button>


      {/* Modal */}
      {showModal && (
        <div className="custom-modal-bg">
          <div className="custom-modal-dialog">
            <div className="custom-modal-content">
              {/* Modal header */}
              <div className="custom-modal-header">
                <span className="custom-modal-title">Add Event</span>
                <button
                  type="button"
                  className="custom-modal-close"
                  title="Close"
                  onClick={() => setShowModal(false)}
                >
                  &times;
                </button>
              </div>

              {/* Modal body */}
              <div className="custom-modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-2">
                    <label htmlFor="event-desc" className="form-label">
                      Event Title
                    </label>
                    <textarea
                      id="event-desc"
                      className="form-control"
                      rows={3}
                      maxLength={50}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    {errors.name && <small className="text-danger">{errors.name}</small>}
                    <div className="char-count">{name.length}/50</div>
                  </div>

                  <div className="mb-2">
                    <label htmlFor="event-date" className="form-label">
                      Date:
                    </label>
                    <input
                      id="event-date"
                      type="date"
                      className="form-control"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={minDate}
                    />
                    {errors.date && <small className="text-danger">{errors.date}</small>}
                  </div>

                  {error && <p className="text-danger">{error}</p>}

                  {/* Footer buttons */}
                  <div className="custom-modal-footer">
                    <button
                      type="button"
                      // className="btn"
                      // style={{ borderColor: "#3A5FBE", color: "#3A5FBE" }}
  className="btn btn-sm custom-outline-btn"
            style={{  minWidth: 90 }}
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                    className="btn btn-sm custom-outline-btn"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Adding..." : "Add"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AddEventForm;

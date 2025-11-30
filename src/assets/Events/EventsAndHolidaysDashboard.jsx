import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AddHolidayForm from "../Holidays/AddHolidaysForms";
import AddEventForm from "./AddEventForm";
import './EventAndHolidays.css'

function EventsAndHolidaysDashboard() {
    const [holidayList, setHolidayList] = useState([]);
      const [eventsList, setEventsList] = useState([]);
  const { role } = useParams();
  const isAdmin = role === "admin";
  const currentYear = new Date().getFullYear();

  const today = new Date();
today.setHours(0, 0, 0, 0); 
const upcomingHolidays = holidayList.filter((h) => {
  const holidayDate = new Date(h.date);
  holidayDate.setHours(0, 0, 0, 0); // normalize
  return holidayDate >= today;
});

today.setHours(0, 0, 0, 0); 
const upcomingEvents = eventsList.filter((event) => {
  const eventDate = new Date(event.date);
  eventDate.setHours(0, 0, 0, 0); // normalize
  return eventDate >= today;
});

  // ------------------ HOLIDAYS ------------------


  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await axios.get("https://cws-server.vercel.app/getHolidays");
        const currentYearHolidays = res.data.filter(
          (h) => new Date(h.date).getFullYear() === currentYear
        );
        setHolidayList(currentYearHolidays);
      } catch (err) {
        console.error("Failed to fetch holidays:", err.response || err.message);
      }
    };

    fetchHolidays();
  }, []);

  const handleDeleteHoliday = async (id) => {
    if (!window.confirm("Are you sure you want to delete this holiday?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`https://cws-server.vercel.app/holidays/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHolidayList((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      console.error("Failed to delete holiday:", err.response || err.message);
      alert("Failed to delete holiday.");
    }
  };


  // ------------------ EVENTS ------------------


  // useEffect(() => {
  //   const fetchEvents = async () => {
  //     try {
  //       const token = localStorage.getItem("accessToken"); // assuming auth is needed
  //       const res = await axios.get(
  //         "  https://cws-server.vercel.app/events-for-employee",
  //         { headers: { Authorization: `Bearer ${token}` } }
  //       );
  //       // Sort events by date
  //       const sortedEvents = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));
  //       setEventsList(sortedEvents);
  //     } catch (err) {
  //       console.error("Failed to fetch events:", err.response || err.message);
  //     }
  //   };

  //   fetchEvents();
  // }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get("https://cws-server.vercel.app/events-for-employee", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Events response:", res.data); // 👀 check shape
        const sortedEvents = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));
        setEventsList(sortedEvents);
      } catch (err) {
        console.error("Failed to fetch events:", err.response || err.message);
      }
    };

    fetchEvents();
  }, []);


  const handleDeleteEvent = async (id) => {
    console.log(id)
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`https://cws-server.vercel.app/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEventsList((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      console.error("Failed to delete event:", err.response || err.message);
      alert("Failed to delete event.");
    }
  }

const handleAddEvent = (newEvent) => {
  console.log("🧩 New event received in handleAddEvent:", newEvent);
  setEventsList((prev) => {
    const updated = [...prev, newEvent];
    return updated.sort((a, b) => new Date(a.date) - new Date(b.date));
  });
};

// ✨ NEW — when AddHolidayForm adds a holiday
const handleAddHoliday = (newHoliday) => {
  setHolidayList((prev) => {
    const updated = [...prev, newHoliday];
    return updated.sort((a, b) => new Date(a.date) - new Date(b.date));
  });
};



  return (
    <div className="container events-holidays-container">
      <div className="row">
        {/* ------------------ EVENTS ------------------ */}
        <div className="col-md-6 mb-4">
          <div className="section-header">
            <h5 className="section-title">Upcoming Events</h5>
            {isAdmin && <AddEventForm onAdd={handleAddEvent} />}
          </div>

          {eventsList.length === 0 ? (
            <div className="alert alert-info no-data-alert">No upcoming events</div>
          ) : (
            <div className="scrollable-list">
              {upcomingEvents.map((event, idx) => (
                <div key={idx} className="card shadow-sm border-0 event-holiday-card">
                  <div className="card-body">
                    <h6 className="card-title">{event.type}</h6>
                    <hr className="card-divider" />
                    <i
                      className={`event-icon me-2 fs-4 ${event.type === "Birthday"
                          ? "bi bi-gift"
                          : event.type === "Team Outing"
                            ? "bi bi-geo-alt"
                            : "bi bi-calendar-event"
                        }`}
                    ></i>
                    <div className="card-content-center">
                      <div>
                        <div className="event-name" style={{ textTransform: "capitalize" }}>{event.name}</div>
                        <div className="event-details">
                          {new Date(event.date).toLocaleDateString("en-CA", {
                            month: "short",
                            day: "numeric",
                            weekday: "short",
                          })}
                          {event.startTime && event.endTime && (
                            <>
                              {" | "}
                              {event.startTime} – {event.endTime}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        className="btn btn-sm btn-outline-danger delete-btn"
                        onClick={() => handleDeleteEvent(event._id || event.id)}
                      >
                        <i className="bi bi-trash delete-icon"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ------------------ HOLIDAYS ------------------ */}
        <div className="col-md-6 mb-4">
          <div className="section-header">
            <h5 className="section-title">Upcoming Holidays</h5>
            {/* {isAdmin && <AddHolidayForm />} */}
            {isAdmin && <AddHolidayForm onAdd={handleAddHoliday} />}

          </div>

          {holidayList.length > 0 ? (
            <div className="scrollable-list">
              {upcomingHolidays.map((h) => (
                <div key={h._id || h.name} className="card shadow-sm border-0 event-holiday-card">
                  <div className="card-body">
                    <h6 className="card-title">Holiday</h6>
                    <hr className="card-divider" />
                    <i className="bi bi-star me-2 holiday-icon"></i>
                    <div className="card-content-center">
                      <div>
                        <div className="holiday-name" style={{ textTransform: "capitalize" }}>{h.name}</div>
                        <div className="holiday-details">
                          {new Date(h.date).toLocaleDateString("en-CA", {
                            month: "short",
                            day: "numeric",
                            weekday: "short",
                          })}
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        className="btn btn-sm btn-outline-danger delete-btn"
                        onClick={() => handleDeleteHoliday(h._id)}
                      >
                        <i className="bi bi-trash delete-icon"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-info no-data-alert">
              No holidays found for {currentYear}.
              {isAdmin && " Please add holidays for this year."}
            </div>
          )}
        </div>
      </div>

       <div className="text-end mt-3">
       <button
    className="btn btn-sm custom-outline-btn"
            style={{  minWidth: 90 }}
  onClick={() => window.history.go(-1)}
>
  Back
</button>
</div>
    </div>



  );
}

export default EventsAndHolidaysDashboard;

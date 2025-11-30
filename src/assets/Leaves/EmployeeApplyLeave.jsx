import React, { useState, useEffect } from "react";
import axios from "axios";

function EmployeeApplyLeave({ user, onLeaveApplied }) {
  const [form, setForm] = useState({
    leaveType: "SL",
    dateFrom: "",
    dateTo: "",
    duration: "full",
    reason: "",
  });
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [availableLeaveTypes, setAvailableLeaveTypes] = useState([]);
  const [manager, setManager] = useState(null); // populated manager details
  const [weeklyOffs, setWeeklyOffs] = useState([]);

  // useEffect(() => {
  //   const fetchWeeklyOffs = async () => {
  //     try {
  //       const res = await axios.get(
  //         `https://cws-server.vercel.app/admin/weeklyoff/${new Date().getFullYear()}`
  //       );

  //       // 🛠️ Ensure it's always an array of date strings
  //       let data = res.data;

  //       // if response is { weeklyOffs: [...] } → extract array
  //       if (data && typeof data === "object" && !Array.isArray(data)) {
  //         data = data.weeklyOffs || [];
  //       }

  //       // finally store as array
  //       setWeeklyOffs(Array.isArray(data) ? data : []);
  //       console.log("week off", weeklyOffs)
  //     } catch (err) {
  //       console.error("Error fetching weekly offs:", err);
  //       setWeeklyOffs([]); // fallback to empty
  //     }
  //   };
  //   fetchWeeklyOffs();
  // }, []);

  useEffect(() => {
    const fetchWeeklyOffs = async () => {
      try {
        const res = await axios.get(
          `https://cws-server.vercel.app/admin/weeklyoff/${new Date().getFullYear()}`
        );

        // 👇 Extract weekly off data safely
        const weeklyData = res.data?.data || res.data || {};
        const saturdayOffs = weeklyData.saturdays || []; // example: [2, 4]
        const sundayOff = true; // all Sundays are off by rule

        // ✅ Store in state
        setWeeklyOffs({ saturdays: saturdayOffs, sundayOff });
        console.log("✅ Weekly offs fetched:", { saturdays: saturdayOffs, sundayOff });
      } catch (err) {
        console.error("❌ Error fetching weekly offs:", err);
        setWeeklyOffs({ saturdays: [], sundayOff: true }); // fallback: all Sundays off
      }
    };

    fetchWeeklyOffs();
  }, []);

  useEffect(() => {
    if (weeklyOffs.length > 0) {
      console.log("✅ Weekly offs fetched:", weeklyOffs);
    }
  }, [weeklyOffs]);

  // Fetch populated manager details
  useEffect(() => {
    const fetchManager = async () => {
      if (!user?.reportingManager) return;
      try {
        const res = await axios.get(`https://cws-server.vercel.app/users/${user.reportingManager}`);
        setManager(res.data);
      } catch (err) {
        console.error("Error fetching manager:", err);
      }
    };
    fetchManager();
  }, [user]);

  // Determine available leave types based on probation
  useEffect(() => {
    if (!showModal) return;

    const now = new Date();
    const doj = new Date(user.doj);
    const probationEnd = new Date(doj);
    probationEnd.setMonth(probationEnd.getMonth() + user.probationMonths);

    if (now < probationEnd) {
      setForm(prev => ({ ...prev, leaveType: "LWP" }));
      setAvailableLeaveTypes(["LWP"]);
    } else {
      const leaveTypes = ["SL", "CL", "LWP"];
      setForm(prev => ({ ...prev, leaveType: "SL" }));
      setAvailableLeaveTypes(leaveTypes);
    }
  }, [showModal, user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const today = new Date();
  const minDate = today.toISOString().split("T")[0];
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 2);
  const maxDate = futureDate.toISOString().split("T")[0];



  const handleSubmit = async (e) => {
    e.preventDefault();

    const fromDate = new Date(form.dateFrom);
    const toDate = new Date(form.dateTo);
    const min = new Date(minDate);
    const max = new Date(maxDate);

    if (!form.reason || !form.dateFrom || !form.dateTo) {
      setMessage("Please fill all required fields");
      return;
    }

    if (fromDate < min) {
      setMessage("From date cannot be before the current month.");
      return;
    }

    if (toDate > max) {
      setMessage("To date cannot be beyond next month.");
      return;
    }

    if (toDate < fromDate) {
      setMessage("⚠️ Invalid date range: 'To Date' cannot precede 'From Date'.");
      return;
    }

    if (!form.reason || !form.dateFrom || !form.dateTo) {
      setMessage("Please fill all required fields");
      return;
    }

    //    // 🚫 Prevent applying on Sunday or weekly off
    // for (
    //   let d = new Date(form.dateFrom);
    //   d <= new Date(form.dateTo);
    //   d.setDate(d.getDate() + 1)
    // ) {
    //   const dateStr = d.toISOString().split("T")[0];
    //   const isSunday = new Date(d).getDay() === 0;
    //   const isWeeklyOff = weeklyOffs.includes(dateStr);
    //   if (isSunday || isWeeklyOff) {
    //     alert(`You cannot apply for leave on Sundays or weekly off days (${dateStr}).`);
    //     return;
    //   }
    // }

    // 🚫 Prevent applying on Sunday or weekly off (Saturday/Sunday)
    for (
      let d = new Date(form.dateFrom);
      d <= new Date(form.dateTo);
      d.setDate(d.getDate() + 1)
    ) {
      const date = new Date(d);
      const dateStr = date.toISOString().split("T")[0];
      const day = date.getDay(); // 0 = Sunday, 6 = Saturday

      // Check Sunday off
      // if (weeklyOffs.sundayOff && day === 0) {
      //   alert(`❌ Cannot apply leave on Sunday (${dateStr}).`);
      //   return;
      // }
      // Check Sunday off
      if (weeklyOffs.sundayOff && day === 0) {
        alert(`❌As per the system's sandwich leave policy, applying manual leave on weekends is restricted. (${dateStr}`);
        return;
      }

      // Check 2nd/4th Saturday off
      if (day === 6 && Array.isArray(weeklyOffs.saturdays)) {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        let saturdayCount = 0;
        for (let temp = new Date(firstDay); temp <= date; temp.setDate(temp.getDate() + 1)) {
          if (temp.getDay() === 6) saturdayCount++;
        }

        if (weeklyOffs.saturdays.includes(saturdayCount)) {
          alert(`❌ Cannot apply leave on weekly off Saturday (${dateStr}).`);
          return;
        }
      }
    }


    try {

      // ✅ 1️⃣ Fetch existing leaves of employee
      const existingLeavesRes = await axios.get(
        `https://cws-server.vercel.app/leave/my/${user._id}`
      );
      const existingLeaves = existingLeavesRes.data || [];

      // ✅ 2️⃣ Check if any existing leave overlaps with new one
      const isOverlapping = existingLeaves.some((leave) => {
        const leaveFrom = new Date(leave.dateFrom);
        const leaveTo = new Date(leave.dateTo);

        // normalize time
        leaveFrom.setHours(0, 0, 0, 0);
        leaveTo.setHours(23, 59, 59, 999);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);

        // overlap check
        return (
          (fromDate <= leaveTo && toDate >= leaveFrom) &&
          leave.status !== "rejected" // ignore rejected
        );
      });

      if (isOverlapping) {
        setMessage("⚠️ You already applied for leave on one or more of these dates.");
        alert("⚠️ You already applied for leave on one or more of these dates.");
        return;
      }






      await axios.post("https://cws-server.vercel.app/leave/apply", {
        employeeId: user._id,
        leaveType: form.leaveType,
        dateFrom: form.dateFrom,
        dateTo: form.dateTo,
        duration: form.duration,
        reason: form.reason,
        reportingManagerId: manager?._id || null, // send manager ID
      });

      //setMessage("Leave applied successfully! Waiting for approval.");
      alert("Leave applied successfully! Waiting for approval.");

      // ✅ Trigger parent refresh
      if (typeof onLeaveApplied === "function") onLeaveApplied();

      setForm({
        leaveType: availableLeaveTypes[0],
        dateFrom: "",
        dateTo: "",
        duration: "full",
        reason: "",
      });
      setShowModal(false);


    } catch (err) {
      setMessage(err.response?.data?.error || "Error applying leave");
    }
  };


  const [daysCount, setDaysCount] = useState(0); // 👈 New state

  // 🧮 Calculate number of days whenever from/to changes
  useEffect(() => {
    if (form.dateFrom && form.dateTo) {
      const start = new Date(form.dateFrom);
      const end = new Date(form.dateTo);

      if (end >= start) {
        const diffTime = end - start;
        const diffDays = diffTime / (1000 * 60 * 60 * 24) + 1; // include both dates
        setDaysCount(diffDays);
      } else {
        setDaysCount(0); // if invalid range
      }
    } else {
      setDaysCount(0);
    }
  }, [form.dateFrom, form.dateTo]);



  return (
    <>
     

                  <button
                    className="btn btn-sm custom-outline-btn me-2"
                    // style={{
                    //   whiteSpace: "nowrap",
                    //   height: "31px",
                    //   display: "flex",
                    //   alignItems: "center",
                    //   justifyContent: "center",
                    // }} 
      onClick={() => setShowModal(true)}>
        Apply Leave
      </button>
      <style>{`
        .modal-body .btn:focus {
          outline: none;
        }

        .modal-body .btn:focus-visible {
          outline: 3px solid #3A5FBE;
          outline-offset: 2px;
          box-shadow: 0 0 0 4px rgba(58, 95, 190, 0.25);
          transform: scale(1.02);
          transition: all 0.2s ease;
        }

        .modal-body button[type="submit"]:focus-visible {
          outline: 3px solid #ffffff;
          outline-offset: 2px;
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.4);
          filter: brightness(1.1);
        }

        .modal-body button[type="button"]:focus-visible {
          outline: 3px solid #3A5FBE;
          outline-offset: 2px;
          box-shadow: 0 0 0 4px rgba(58, 95, 190, 0.25);
          background-color: rgba(58, 95, 190, 0.05);
        }

        .modal-body input:focus-visible {
          outline: 2px solid #3A5FBE;
          outline-offset: 2px;
          border-color: #3A5FBE;
          box-shadow: 0 0 0 3px rgba(58, 95, 190, 0.15);
        }
      `}</style>

      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog" style={{ maxWidth: "600px", marginTop: "50px" }}>
            <div className="modal-content">
              <div className="modal-header text-white" style={{ backgroundColor: "#3A5FBE" }}>
                <h5 className="modal-title" >Apply Leave</h5>
                <button type="button" className="btn-close btn-close-white"
                  onClick={() => {
                    setShowModal(false);
                    setForm({
                      leaveType: "SL",
                      dateFrom: "",
                      dateTo: "",
                      duration: "full",
                      reason: "",
                    });
                    setMessage("");
                    setDaysCount(0);

                  }}></button>
              </div>
              <div className="modal-body" style={{ paddingTop: "24px" }}>
                {/* {message && <div className="alert alert-info">{message}</div>} */}
                <form onSubmit={handleSubmit}>

                  {/* Leave Type */}
                  <div className="mb-3  d-flex align-items-center">
                    <label style={{ fontWeight: "500", fontSize: "14px", color: "#495057", width: "90px", flexShrink: 0, minWidth: "fit-content" }}>Leave type:</label>{/* NEW: Fixed width for all labels */}
                    <div className="d-flex gap-4">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="leaveType"
                          id="casual-radio"
                          value="CL"
                          checked={form.leaveType === "CL"}
                          onChange={handleChange}
                          disabled={availableLeaveTypes.length === 1 && availableLeaveTypes[0] === "LWP"}
                          style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#2E4A8B" }}
                        />
                        <label className="form-check-label" htmlFor="casual-radio" style={{ fontSize: "14px", color: "#495057", marginLeft: "8px", cursor: "pointer" }}>
                          Casual
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="leaveType"
                          id="sick-radio"
                          value="SL"
                          checked={form.leaveType === "SL"}
                          onChange={handleChange}
                          disabled={availableLeaveTypes.length === 1 && availableLeaveTypes[0] === "LWP"}
                          style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#2E4A8B" }}
                        />
                        <label className="form-check-label" htmlFor="sick-radio" style={{ fontSize: "14px", color: "#495057", marginLeft: "8px", cursor: "pointer" }}>
                          Sick
                        </label>
                      </div>
                      <div className="form-check">
                        {availableLeaveTypes.includes("LWP") && (
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="leaveType"
                              value="LWP"
                              checked={form.leaveType === "LWP"}
                              onChange={handleChange}
                              style={{ width: "20px", height: "20px", accentColor: "#2E4A8B" }}
                            />
                            <label
                              className="form-check-label"
                              style={{ fontSize: "14px", marginLeft: "8px" }}
                            >
                              Leave Without Pay
                            </label>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                  {/* Half Day */}
                  <div className="mb-3 d-flex align-items-center">
                    <label style={{ fontWeight: "500", fontSize: "14px", color: "#495057", width: "90px", flexShrink: 0 }}>Half day:</label> {/* NEW: Fixed width */}                    <div className="form-check">
                      <input
                        disabled
                        type="checkbox"
                        name="duration"
                        className="form-check-input"
                        checked={form.duration === "half"}
                        onChange={(e) => setForm(prev => ({ ...prev, duration: e.target.checked ? "half" : "full" }))}
                        style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#2E4A8B" }}
                      />
                    </div>
                  </div>
                  {/* Dates */}
                  <div className="mb-3  d-flex align-items-center" >
                    <label style={{ fontWeight: "500", fontSize: "14px", color: "#495057", width: "90px", flexShrink: 0 }}>Select Date:</label>
                    <div className="row">
                      <div className="col-md-4">
                        <label style={{ fontSize: "12px", color: "#6c757d", marginBottom: "6px" }}>From</label>
                        <input
                          type="date"
                          name="dateFrom"
                          value={form.dateFrom}
                          onChange={handleChange}
                          className="form-control"
                          required
                          style={{ fontSize: "14px", padding: "8px 12px", border: "1px solid #ced4da", borderRadius: "4px" }}
                          min={minDate}    // cannot select past date
                          max={maxDate}    // cannot select beyond next 2 months
                        />
                      </div>
                      <div className="col-md-4">
                        <label style={{ fontSize: "12px", color: "#6c757d", marginBottom: "6px" }}>To</label>
                        <input
                          type="date"
                          name="dateTo"
                          value={form.dateTo}
                          onChange={handleChange}
                          className="form-control"
                          required
                          style={{ fontSize: "14px", padding: "8px 12px", border: "1px solid #ced4da", borderRadius: "4px" }}
                          min={minDate}    // cannot select past date
                          max={maxDate}    // cannot select beyond next 2 months
                        />
                      </div>

                      {/* No of Days */}
                      <div className="col-md-4">
                        <label style={{ fontSize: "12px", color: "#6c757d", marginBottom: "6px" }}>No of Days</label>
                        <input
                          type="text"
                          value={daysCount}
                          className="form-control"
                          readOnly
                          style={{ fontSize: "14px", padding: "8px 12px", border: "1px solid #ced4da", borderRadius: "4px", backgroundColor: "#f8f9fa" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Apply to section */}
                  <div className="mb-3  d-flex align-items-center">
                    <label style={{ fontWeight: "500", fontSize: "14px", color: "#495057", width: "90px", flexShrink: 0 }}>Apply to:</label>
                    <input type="text" className="form-control"
                      value={
                        manager
                          ? `${manager.role.charAt(0).toUpperCase() + manager.role.slice(1)} (${manager.name})`
                          : 'No manager assigned'
                      }
                      style={{
                        fontSize: "14px", padding: "8px 12px", border: "1px solid #ced4da", borderRadius: "4px", maxWidth: "250px",
                        backgroundColor: "#f8f9fa", textTransform: "capitalize", flex: 1, /* Keep flex: 1 */
                      }} />
                  </div>

                  {/* Reason */}
                  <div className="mb-3  d-flex align-items-center">
                    <label style={{ fontWeight: "500", fontSize: "14px", color: "#495057", width: "90px", flexShrink: 0 }}>Reason:</label>
                    <textarea name="reason" value={form.reason} onChange={handleChange} className="form-control"
                      style={{
                        flex: 1,
                        minHeight: "80px", /* ADDED: Set minimum height */
                        resize: "vertical" /* ADDED: Allow vertical resize only */
                      }}
                      required />
                  </div>

                  {/* Buttons */}
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" 
                    className="btn btn-sm custom-outline-btn" 
                    //  style={{  padding: "10px 32px", fontSize: "14px", fontWeight: "500", borderRadius: "4px" }} 
                    style={{ backgroundColor: "transparent", color: "#3A5FBE", border: "1px solid #3A5FBE", padding: "10px 28px", fontSize: "14px", fontWeight: "500", borderRadius: "4px" }}
                      onClick={() => {
                        setShowModal(false);
                        setForm({
                          leaveType: "SL",
                          dateFrom: "",
                          dateTo: "",
                          duration: "full",
                          reason: "",
                        });
                        setMessage("");
                        setDaysCount(0);
                      }}>Cancel</button>
                    <button type="submit" 
                    className="btn btn-sm custom-outline-btn" 
                     style={{  padding: "10px 32px", fontSize: "14px", fontWeight: "500", borderRadius: "4px" }} 
                    >Apply</button>
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

export default EmployeeApplyLeave;

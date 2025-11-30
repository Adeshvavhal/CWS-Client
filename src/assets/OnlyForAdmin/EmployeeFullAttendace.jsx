import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx"; // ✅ Import xlsx

function EmployeeFullAttendance() {
  const { empId } = useParams();
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
   // 🔹 Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");
        const authAxios = axios.create({
          baseURL: "  https://cws-server.vercel.app",
          headers: { Authorization: `Bearer ${token}` },
        });

        const empRes = await axios.get(` https://cws-server.vercel.app/employees/${empId}`);
        setEmployee(empRes.data);

        const attRes = await authAxios.get(`/attendance/all/${empId}`);
        setAttendance(attRes.data);
        setFilteredAttendance(attRes.data);
      } catch (err) {
        console.error("Error fetching employee attendance:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [empId]);

  const handleFilter = () => {
    if (!fromDate || !toDate) {
      alert("Please select both From and To dates");
      return;
    }
    if (toDate < fromDate) {
      alert('“To” date cannot be earlier than “From” date.');
      return;
    }
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    const filtered = attendance.filter((att) => {
      const attDate = new Date(att.date);
      return attDate >= from && attDate <= to;
    });
    setFilteredAttendance(filtered);
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setFilteredAttendance(attendance);
  };

  // ✅ Function to export data to Excel
  const handleDownloadExcel = () => {
    if (filteredAttendance.length === 0) {
      alert("No attendance data to download!");
      return;
    }

    // Map data for Excel
    const excelData = filteredAttendance.map((att) => ({
      Date: new Date(att.date).toLocaleDateString("en-GB"),
      Mode: att.mode,
      "Check In": att.checkIn
        ? new Date(att.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "-",
      "Check Out": att.checkOut
        ? new Date(att.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "-",
      "Total Hours": att.workingHours ? `${att.workingHours} hrs` : "-",
      "Day Status": att.dayStatus,
      Details:
        att.regularizationRequest && att.regularizationRequest.status
          ? `Regularization (${att.regularizationRequest.status})`
          : att.dayStatus === "Leave"
            ? `Leave (${att.leaveType || "N/A"})`
            : "Normal Attendance",
    }));

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");

    // Download Excel file
    XLSX.writeFile(wb, `${employee?.name || "Employee"}_Attendance.xlsx`);
  };

  //  if (loading) return <p>Loading...</p>;
  if (loading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div
          className="spinner-grow"
          role="status"
          style={{ width: "4rem", height: "4rem", color: "#3A5FBE" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 fw-semibold" style={{ color: "#3A5FBE" }}>Loading ...</p>
      </div>
    );
  }
  // Format: 1 Oct 2025
  const fmtDate = (d) =>
    new Date(d).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  // Status pill styles
  const statusBase = {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 32,
    width: 112,

    fontWeight: 500,
    fontSize: 14,
  };
  const statusColors = {
    Present: { background: '#d1f7df' },
    Absent: { background: '#f8d7da' },
    'Half Day': { background: '#fff3cd' },
    Working: { background: '#cff4fc' },
    Leave: { background: '#e7e9ff' },
  };
//jacy code
const sortedAndFilteredData =filteredAttendance
   .filter(att => new Date(att.date) <= new Date())
   .sort((b, a) => new Date(a.date) - new Date(b.date));

    // 🔹 Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAndFilteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedAndFilteredData.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const todayISO = (() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  })();


  return (
    <div className="container p-4">
      {employee && (
        <div className="mb-3">
          <h3 className="mb-3" style={{ color: "#3A5FBE", fontSize: "25px" }}>
            <span style={{ textTransform: "capitalize" }}>{employee.name}</span>'s Attendance
          </h3>
        </div>
      )}

      {/* 🔹 Filter Section */}
      {/* 🔹 Filter Section */}
      <div
        className="filter-grid"
        style={{
          background: '#fff',
          borderRadius: 8,
          padding: '12px 16px',
          border: '1px solid #e5e7eb',
          marginBottom: 16,
        }}
      >
        <style>
          {`
              /* Base: mobile-first, 1 column stack with consistent gaps */
              .filter-grid {
                display: grid;
                grid-template-columns: 1fr;
                grid-auto-rows: minmax(38px, auto);
                gap: 12px;
              }
              .fg-row { display: contents; } /* allows label+input to align in grid areas */

              /* Inputs full width on mobile */
              .fg-input {
                width: 100% !important;
                height: 38px;
                border-radius: 6px;
                border: 1px solid #dee2e6;
                padding: 6px 10px;
                font-size: 14px;
                color: #212529;
              }
              .fg-label {
                color: #3A5FBE;
                font-size: 18px;
                font-weight: 600;
                align-self: center;
              }
              .fg-actions {
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
                justify-content: flex-start; /* mobile: left align */
              }
              .fg-actions .btn {
                height: 38px;
                padding: 6px 14px;
                font-size: 14px;
                font-weight: 600;
              }

              /* Tablet ≥ 600px: 2-column grid: [label input] [label input], buttons full row */
              @media (min-width: 600px) {
                .filter-grid {
                  grid-template-columns: auto minmax(220px, 1fr) auto minmax(220px, 1fr);
                  align-items: center;
                  column-gap: 16px;
                  row-gap: 12px;
                }
                .fg-actions {
                  grid-column: 1 / -1;      /* span full width under inputs */
                  justify-content: flex-end;/* tablet: right align buttons */
                }
              }

              /* Desktop ≥ 992px: keep 4 columns; distribute space and keep right-aligned buttons */
              @media (min-width: 992px) {
                .filter-grid {
                  grid-template-columns: auto 240px auto 240px 1fr; /* last column acts as spacer */
                  column-gap: 20px;
                }
                .fg-actions {
                  grid-column: 5 / 6;       /* sit in the right spacer column */
                  justify-content: flex-end;
                }
              }
            `}
        </style>

        {/* From (label + input) */}
        <div className="fg-row">
          <label className="fg-label">From</label>
          <input
            type="date"
            className="fg-input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            placeholder="DD/MM/YYYY"
            max={todayISO}
          />
        </div>

        {/* To (label + input) */}
        <div className="fg-row">
          <label className="fg-label">To</label>
          <input
            type="date"
            className="fg-input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            placeholder="DD/MM/YYYY"
            max={todayISO}
          />
        </div>

        {/* Actions */}
        <div className="fg-actions">
          <button 
          // className="btn text-white" 
          onClick={handleFilter} 
          className="btn btn-sm custom-outline-btn"
            style={{  minWidth: 90 }}
         >Filter</button>
          <button
          className="btn btn-sm custom-outline-btn"
            style={{  minWidth: 90 }}
            onClick={handleReset}
          >
            Reset
          </button>
          <button
            className="btn btn-sm custom-outline-btn"
            style={{  minWidth: 90 }}
            onClick={handleDownloadExcel}
          >
            Download Excel
          </button>
        </div>
      </div>

      {/* 🔹 Table Section */}
      {filteredAttendance.length === 0 ? (
        <p>No attendance records found for selected dates.</p>
      ) : (
        <div className="table-responsive" style={{ background: "#fff" }}>
  <table className="table table-hover mb-0">
    <thead className="table-light" style={{ backgroundColor: "white" }}>
      <tr>
        <th style={{ backgroundColor: "white", fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Date</th>

        <th style={{ backgroundColor: "white", fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Check In</th>

        <th style={{ backgroundColor: "white", fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Check Out</th>

        <th style={{ backgroundColor: "white", fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Total Hours</th>

        <th style={{ backgroundColor: "white", fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Mode</th>

        <th style={{ backgroundColor: "white", fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Status</th>

        <th style={{ backgroundColor: "white", fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Location</th>
      </tr>
    </thead>
            <tbody>
              {currentItems.map((att) => {
                const date = fmtDate(att.date);
                const checkIn = att.checkIn
                  ? new Date(att.checkIn).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  : "-";
                const checkOut = att.checkOut
                  ? new Date(att.checkOut).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  : "-";
                const workingHours = att.workingHours
                  ? `${att.workingHours} hrs`
                  : "-";
// jacy code
                  const modeDisplay =
                  att.dayStatus === "Absent"||att.dayStatus === "Leave"||att.dayStatus ==="Leave (Sandwiched)"
                    ? "-"
                    : att.dayStatus === "Present" && att.mode === "Office"
                      ? "WFO"
                      : att.mode;


                const reg = att.regularizationRequest;
                const hasRegularization = reg && reg.status !== null;
                const isLeave = att.dayStatus === "Leave";
                const leaveType = att.leaveType;

                let details = "";
                if (hasRegularization) {
                  details = `Regularization (${reg.status})`;
                } else if (isLeave) {
                  details = `Leave (${leaveType || "N/A"})`;
                } else if (att.checkIn || att.checkOut) {
                  details = "Checked In/Out Normally";
                } else {
                  details = "No Activity";
                }

                return (
                  <tr key={att._id}>
                    <td  style={{ padding: '12px', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{date}</td>

                    <td  style={{ padding: '12px', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{checkIn}</td>
                    <td  style={{ padding: '12px', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{checkOut}</td>
                    <td  style={{ padding: '12px', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{workingHours}</td>
                    <td  style={{ padding: '12px', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{modeDisplay}</td>
                    <td  style={{ padding: '12px', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}><span style={{ ...statusBase, ...(statusColors[att.dayStatus] || {}) }}>{att.dayStatus}</span></td>
                    
                    <td
  style={{
    padding: "12px",
    fontSize: "14px",
    borderBottom: "1px solid #dee2e6",
    whiteSpace: "nowrap",
  }}
>
  {att.employeeCheckInLocation?.address || "N/A"}
</td>{/* <td>{details}</td> */}
                  </tr>
                );
              })}
            </tbody>
          </table>

           
        </div>
      )}
{/* 🔹 Pagination Controls */}
          <nav className="d-flex align-items-center justify-content-end mt-3 text-muted">
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center">
                <span style={{ fontSize: "14px", marginRight: "8px" }}>Rows per page:</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto", fontSize: "14px" }}
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
              </div>

              <span style={{ fontSize: "14px", marginLeft: "16px" }}>
                {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredAttendance.length)} of {filteredAttendance.length}
              </span>

              <div className="d-flex align-items-center" style={{ marginLeft: "16px" }}>
                <button
                  className="btn btn-sm border-0"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{ fontSize: "18px", padding: "2px 8px" }}
                >
                  ‹
                </button>
                <button
                  className="btn btn-sm border-0"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{ fontSize: "18px", padding: "2px 8px" }}
                >
                  ›
                </button>
              </div>
            </div>
          </nav>
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

export default EmployeeFullAttendance;

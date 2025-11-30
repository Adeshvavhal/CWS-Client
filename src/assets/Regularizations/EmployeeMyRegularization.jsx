import React, { useEffect, useState } from "react";
import axios from "axios";
import AllRequest from "../All/AllRequest";

function EmployeeMyRegularization({ employeeId, refreshKey }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  //new state
  const [statusFilter, setStatusFilter] = useState("All");
const [dateFromFilter, setDateFromFilter] = useState("");
const [dateToFilter, setDateToFilter] = useState("");
const [filteredRequests, setFilteredRequests] = useState([]);



  // dipali code 
  const [selectedRequest, setSelectedRequest] = useState(null);


  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(
          `https://cws-server.vercel.app/attendance/regularization/my/${employeeId}`
        );
        // ✅ Sort newest first (based on createdAt or request date)
        const sortedData = res.data.sort(
          (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
        );

        setRequests(sortedData);
        console

        //setRequests(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch regularization requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [employeeId, refreshKey]);

 // dipali code
useEffect(() => {
  const sorted = requests
    .filter(req =>
      ["Pending", "Rejected", "Approved"].includes(req?.regularizationRequest?.status)
    )
    .sort(
      (a, b) =>
        new Date(b.regularizationRequest?.requestedAt || b.createdAt || b.date) -
        new Date(a.regularizationRequest?.requestedAt || a.createdAt || a.date)
    );

  setFilteredRequests(sorted);
}, [requests]);


  const formatToIST = (utcDateString) => {
  const date = new Date(utcDateString);
  return date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};



  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;

    try {
      await axios.delete(` https://cws-server.vercel.app/attendance/regularization/${id}`);
      setRequests(requests.filter((req) => req._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete request.");
    }
  };


  // // 🔹 Filter only valid regularizations
  // const filteredRequests = requests.filter(
  //   (req) => req.regularizationRequest && req.regularizationRequest.status !== null
  // );

// const filteredRequests = requests
//   .filter((req) => req.regularizationRequest && req.regularizationRequest.status !== null)
//   .sort(
//     (a, b) =>
//       new Date(
//         b.regularizationRequest?.requestedAt ||
//         b.createdAt ||
//         b.date
//       ) -
//       new Date(
//         a.regularizationRequest?.requestedAt ||
//         a.createdAt ||
//         a.date
//       )
//   );



  // 🔹 Pagination logic
  // const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  // const indexOfLastItem = Math.min(currentPage * itemsPerPage, filteredRequests.length);
  // const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  // const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  // dipali code
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, filteredRequests.length);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  // Prevent invalid page after filtering
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  console.log("currentRequests",currentRequests)
  // if (loading) return <p>Loading...</p>;

  if (loading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center mt-5"
        // style={{ minHeight: "100vh" }}
        style={{
          height: "100vh", // Changed from minHeight to height
          width: "100%",
          position: "absolute",
          top: 0,
          left: 0
        }}
      >
        <div
          className="spinner-grow"
          role="status"
          style={{ width: "4rem", height: "4rem", color: "#3A5FBE" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 fw-semibold" style={{ color: "#3A5FBE" }}>
          Loading ...
        </p>
      </div>
    );
  }

  if (error) return <p className="text-danger">{error}</p>;
  // if (filteredRequests.length === 0) return <p>No regularization requests found.</p>;



  const applyFilters = () => {
  let temp = requests.filter(
    req => ["Pending", "Rejected", "Approved"].includes(req.regularizationRequest?.status)
  );

  if (statusFilter !== "All") {
    temp = temp.filter(
      req =>
        (req.regularizationRequest?.status || "").toLowerCase() === statusFilter.toLowerCase()
    );
  }

  if (dateFromFilter) {
    temp = temp.filter(req => new Date(req.date) >= new Date(dateFromFilter));
  }
  if (dateToFilter) {
    temp = temp.filter(req => new Date(req.date) <= new Date(dateToFilter));
  }

 setFilteredRequests(
  temp.sort(
    (a, b) =>
      new Date(b.regularizationRequest?.requestedAt || b.createdAt || b.date) -
      new Date(a.regularizationRequest?.requestedAt || a.createdAt || a.date)
  )
);

  setCurrentPage(1);
};


// Reset button restores original data
const resetFilters = () => {
  setStatusFilter("All");
  setDateFromFilter("");
  setDateToFilter("");
setFilteredRequests(
  requests
    .filter(req =>
      ["Pending", "Rejected", "Approved"].includes(req.regularizationRequest?.status)
    )
    .sort(
      (a, b) =>
        new Date(b.regularizationRequest?.requestedAt || b.createdAt || b.date) -
        new Date(a.regularizationRequest?.requestedAt || a.createdAt || a.date)
    )
);


  setCurrentPage(1);
};

  return (
    <>
    <div className="card mb-4 shadow-sm border-0 mt-2">
  <div className="card-body">
    <form
      className="row g-2 align-items-center"
      onSubmit={e => {
        e.preventDefault();
        applyFilters();
      }}
      style={{ justifyContent: "space-between" }}
    >
     <div className="col-12 col-md-auto d-flex align-items-center gap-2 mb-1">
        <label htmlFor="statusFilter" className="fw-bold mb-0" style={{ fontSize: "16px", color: "#3A5FBE" }}>Status</label>
        <select
          id="statusFilter"
          className="form-select"
          style={{ minWidth: 100 }}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
    <div className="col-12 col-md-auto d-flex align-items-center gap-2 mb-1">
        <label htmlFor="dateFromFilter" className="fw-bold mb-0" style={{ fontSize: "16px", color: "#3A5FBE", width:"50PX"}}>From</label>
        <input
          id="dateFromFilter"
          type="date"
          className="form-control"
          value={dateFromFilter}
          onChange={e => setDateFromFilter(e.target.value)}
          style={{ minWidth: 140 }}
        />
      </div>
      <style>
    {`
    .form-label-responsive {
      display: inline-block;
      width: 50px;
      min-width: 50px;
      text-align: left;
      margin-right: 0;
    }
    @media (min-width: 768px) {
      .form-label-responsive {
        width: 20px !important;
        min-width:20px !important;
        margin-right: 8px !important;
      }
    }
    `}
  </style>
    <div className="col-12 col-md-auto d-flex align-items-center mb-1">
        <label htmlFor="dateToFilter" className="form-label-responsive fw-bold mb-0" style={{ fontSize: "16px", color: "#3A5FBE" }}>To</label>
        <input
          id="dateToFilter"
          type="date"
          className="form-control"
          value={dateToFilter}
          onChange={e => setDateToFilter(e.target.value)}
          style={{ minWidth: 140 }}
        />
      </div>
      <div className="col-auto ms-auto d-flex gap-2">
        <button type="submit" 
         style={{  minWidth: 90 }}
           className="btn btn-sm custom-outline-btn"
        >
          Filter
        </button>
        <button type="button" 
         style={{  minWidth: 90 }}
           className="btn btn-sm custom-outline-btn"
          onClick={resetFilters}>
          Reset
        </button>
      </div>
    </form>
  </div>
</div>


    <div className="card shadow-sm border-0">
      <div className="table-responsive bg-white">
        <table className="table table-hover mb-0">
          <thead style={{ backgroundColor: "#ffffffff" }}>
            <tr >
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Date</th>
             <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Apply Date</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Check-In</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Check-Out</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Mode</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Reason</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Status</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentRequests.length === 0 ? (
    <tr>
      <td colSpan="6" className="text-center py-4" style={{ color: "#6c757d" }}>
        No regularization requests found.
      </td>
    </tr>
  ) : (
      currentRequests.map((req, index) => {
              const checkInTime = req.checkIn || req?.regularizationRequest?.checkIn;
              const checkOutTime = req.checkOut || req?.regularizationRequest?.checkOut;

              return (
                <tr key={req._id || index} onClick={() => setSelectedRequest(req)}  style={{ cursor: "pointer" }}>
                  <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                    {new Date(req.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                    {new Date(req.regularizationRequest.requestedAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{formatToIST(checkInTime)}</td>
                  <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{formatToIST(checkOutTime)}</td>
                  <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{req.mode?.trim().toLowerCase() === "office" ? "WFO" : req.mode}</td>
                  <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{req?.regularizationRequest?.reason || "—"}</td>
                  <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                    {req?.regularizationRequest?.status === "Approved" ? (
                      <span style={{ backgroundColor: '#d1f2dd', padding: '8px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', display: 'inline-block', width: "100px", textAlign: "center" }}>
                        Approved
                      </span>
                    ) : req?.regularizationRequest?.status === "Rejected" ? (
                      <span style={{ backgroundColor: '#f8d7da', padding: '8px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', display: 'inline-block', width: "100px", textAlign: "center" }}>
                        Rejected
                      </span>
                    ) : req?.regularizationRequest?.status === "Pending" ? (
                      <span style={{ backgroundColor: '#FFE493', padding: '8px 16px', borderRadius: '4px', fontSize: '13px', fontWeight: '500', display: 'inline-block', width: "100px", textAlign: "center" }}>
                        Pending
                      </span>
                    ) : (
                      <span className="badge bg-secondary-subtle text-dark px-3 py-2">
                        N/A
                      </span>
                    )}
                  </td>
                  {/* <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>
                    <button
                      // className="btn btn-sm"
                      // style={{
                      //   backgroundColor: "#3A5FBE",
                      //   color: "white",
                      //   borderColor: "#3A5FBE",
                      // }}
                        className="btn btn-sm btn-outline"
          style={{  color: "#3A5FBE", borderColor: "#3A5FBE" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(req._id);
                      }}
                    >
                      Delete
                    </button>
                  </td> */}
                  <td
  style={{
    padding: "12px",
    verticalAlign: "middle",
    fontSize: "14px",
    borderBottom: "1px solid #dee2e6",
    whiteSpace: "nowrap",
  }}
>
  {(req?.regularizationRequest?.status === "Pending" ||
    req?.regularizationRequest?.status === "Rejected") && (
    <button
      // className="btn btn-sm btn-outline"
      // style={{ color: "#3A5FBE", borderColor: "#3A5FBE" }}
                            className="btn btn-outline-danger btn-sm"

      onClick={(e) => {
        e.stopPropagation();
        handleDelete(req._id);
      }}
    >
      Delete
    </button>
  )}
</td>

                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>
</div>


{/* MODAL code */}
     {selectedRequest && (
  <div
    className="modal fade show"
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.5)",
      position: "fixed",
      inset: 0,
      zIndex: 1050,
    }}
  >
    <div className="modal-dialog modal-dialog-scrollable"
         style={{ maxWidth: "650px", width: "95%", marginTop: "200px", }}>
      <div className="modal-content">

        {/* Header */}
        <div className="modal-header text-white" style={{ backgroundColor: "#3A5FBE" }}>
          <h5 className="modal-title mb-0">Regularization Request Details</h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={() => setSelectedRequest(null)}
          />
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-5 col-sm-3 fw-semibold">Date</div>
              <div className="col-7 col-sm-9">
                {new Date(selectedRequest.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-5 col-sm-3 fw-semibold">Apply Date</div>
              <div className="col-7 col-sm-9">
                {new Date(selectedRequest.regularizationRequest.requestedAt)
                  .toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-5 col-sm-3 fw-semibold">Check-In</div>
              <div className="col-7 col-sm-9">
                {formatToIST(
                  selectedRequest.checkIn ||
                  selectedRequest?.regularizationRequest?.checkIn
                )}
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-5 col-sm-3 fw-semibold">Check-Out</div>
              <div className="col-7 col-sm-9">
                {formatToIST(
                  selectedRequest.checkOut ||
                  selectedRequest?.regularizationRequest?.checkOut
                )}
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-5 col-sm-3 fw-semibold">Mode</div>
              <div className="col-7 col-sm-9">
                {selectedRequest.mode?.trim().toLowerCase() === "office"
                  ? "WFO"
                  : selectedRequest.mode || "-"}
              </div>
            </div>

              <div className="row mb-2">
            <div className="col-sm-3 fw-semibold col-5">Reason</div>
            <div
              className="col-sm-9 col-7"
              style={{
                whiteSpace: "normal",
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {selectedRequest?.regularizationRequest?.reason || "-"}
            </div>
          </div>

            <div className="row mb-2">
              <div className="col-5 col-sm-3 fw-semibold">Status</div>
              <div className="col-7 col-sm-9">
                <span
                  className={
                    "badge text-capitalize " +
                    (selectedRequest?.regularizationRequest?.status === "Approved"
                      ? "bg-success"
                      : selectedRequest?.regularizationRequest?.status === "Rejected"
                      ? "bg-danger"
                      : "bg-warning text-dark")
                  }
                >
                  {selectedRequest?.regularizationRequest?.status || "N/A"}
                </span>
              </div>
            </div>

          
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer border-0 pt-0">
          {(selectedRequest?.regularizationRequest?.status === "Pending" ||
            selectedRequest?.regularizationRequest?.status === "Rejected") && (
            <button
              className="btn btn-outline-danger me-2"
              onClick={() => {
                handleDelete(selectedRequest._id);
                setSelectedRequest(null);
              }}
            >
              Delete
            </button>
          )}
          <button
            className="btn btn-outline-primary"
            onClick={() => setSelectedRequest(null)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{/* modal code end */}

  {/* 🔹 Pagination Controls */}
      <nav className="d-flex align-items-center justify-content-end mt-3 text-muted">
        <div className="d-flex align-items-center gap-3">
          {/* Rows per page */}
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

          {/* Range display */}
        {/* Range display */}
          <span style={{ fontSize: "14px", marginLeft: "16px" }}>
            {filteredRequests.length === 0
              ? "0–0 of 0"
              : `${indexOfFirstItem + 1}-${indexOfLastItem} of ${filteredRequests.length}`}
          </span>

          {/* Arrows */}
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
    
      <div className="text-end mt-2" style={{marginRight: "10px"}}>
        <button
           style={{  minWidth: 90 }}
           className="btn btn-sm custom-outline-btn"
          onClick={() => window.history.go(-1)}
        >
          Back
        </button>
      </div>

</>
    
  );
}

export default EmployeeMyRegularization;

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { NavLink, useNavigate,useParams } from "react-router-dom";
// import EmployeeProfileForAdmin from "./EmployeeMyProfileForAdmin";
// import AddEmployee from "../LoginRegistration/AddEmployee";

// function AllEmployeeDetails() {
//   const [employees, setEmployees] = useState([]);
//   const [managersList, setManagersList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [showModal, setShowModal] = useState(false);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [selectedManagerId, setSelectedManagerId] = useState("");
//   const [message, setMessage] = useState("");
//   const [viewEmployee, setViewEmployee] = useState(null);

//   const [showOldEmployees, setShowOldEmployees] = useState(false);
// const [oldEmployees, setOldEmployees] = useState([]);

//   const userRole = localStorage.getItem("role"); // e.g. "admin", "hr", "manager"

//     const { role, username, id } = useParams();

//   //soft delete
//   const handleDeleteEmployee = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this employee?")) return;

//     try {
//       const token = localStorage.getItem("accessToken");
//       await axios.delete(`https://cws-server.vercel.app/soft/deleteEmployee/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setEmployees((prev) => prev.filter((emp) => emp._id !== id));
//       alert("Employee deleted successfully!");
//     } catch (err) {
//       console.error(err);
//       alert("Error deleting employee. Please try again.");
//     }
//   };


//   // //permanent delete
//   // const handleDeleteEmployeepermanent = async (id) => {
//   //   if (!window.confirm("⚠️ Are you sure you want to permanently delete this employee? This action cannot be undone.")) {
//   //     return;
//   //   }

//   //   try {
//   //     const token = localStorage.getItem("accessToken");
//   //     const res = await axios.delete(` https://cws-server.vercel.app/deleteEmployee/${id}`, {
//   //       headers: { Authorization: `Bearer ${token}` },
//   //     });

//   //     if (res.data.success) {
//   //       // Remove employee from local state immediately
//   //       setEmployees((prev) => prev.filter((emp) => emp._id !== id));
//   //       alert("✅ Employee permanently deleted!");
//   //     } else {
//   //       alert("❌ Failed to delete employee.");
//   //     }
//   //   } catch (error) {
//   //     console.error("Error deleting employee:", error);
//   //     alert("Server error while deleting employee.");
//   //   }
//   // };

// const handleDeleteEmployeepermanent = async (id) => {
//   if (
//     !window.confirm(
//       "⚠️ Are you sure you want to permanently delete this employee? This action cannot be undone."
//     )
//   ) {
//     return;
//   }

//   try {
//     const token = localStorage.getItem("accessToken");
//     const res = await axios.delete(`https://cws-server.vercel.app/deleteEmployee/${id}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     console.log("Delete Response:", res.data); // ✅ Debug line

//     if (res.data.success) {
//       setEmployees((prev) => prev.filter((emp) => emp._id !== id));
//       alert("✅ Employee permanently deleted!");
//     } else {
//       alert("❌ Failed to delete employee.");
//     }
//   } catch (error) {
//     console.error("Error deleting employee:", error.response?.data || error.message);
//     alert("Server error while deleting employee.");
//   }
// };


//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(5);

//   const navigate = useNavigate();

//   // Fetch all employees
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const token = localStorage.getItem("accessToken");
//         const res = await axios.get("https://cws-server.vercel.app/getAllEmployees", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setEmployees(res.data || []);
//       } catch (err) {
//         console.error(err);
//         setError("Failed to fetch employees.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchEmployees();
//   }, []);

//   // Handle Assign Manager
//   const handleAssignManagerClick = (emp) => {
//     setSelectedEmployee(emp);
//     setSelectedManagerId(emp.reportingManager?._id || "");
//     const managers = employees.filter(
//       (e) => e.role === "manager" && e._id !== emp._id
//     );
//     setManagersList(managers);
//     setShowModal(true);
//     setMessage("");
//   };

//   const handleUpdateManager = async () => {
//     if (!selectedManagerId) {
//       setMessage("Please select a manager.");
//       return;
//     }
//     try {
//       const token = localStorage.getItem("accessToken");
//       await axios.put(
//         `https://cws-server.vercel.app/users/${selectedEmployee._id}/assign-manager`,
//         { managerId: selectedManagerId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       const managerObj = managersList.find((m) => m._id === selectedManagerId);
//       setEmployees((prev) =>
//         prev.map((emp) =>
//           emp._id === selectedEmployee._id
//             ? { ...emp, reportingManager: managerObj }
//             : emp
//         )
//       );

//       setMessage("Manager assigned successfully!");
//       setShowModal(false);
//     } catch (err) {
//       console.error(err);
//       setMessage("Error assigning manager.");
//     }
//   };


//   // Pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentEmployees = employees.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(employees.length / itemsPerPage);

//   const handlePageChange = (page) => {
//     if (page >= 1 && page <= totalPages) setCurrentPage(page);
//   };


// if (loading) {
//   return (
//     <div
//       className="d-flex flex-column justify-content-center align-items-center"
//       style={{ minHeight: "100vh" }}
//     >
//       <div
//         className="spinner-grow"
//         role="status"
//         style={{ width: "4rem", height: "4rem", color: "#3A5FBE" }}
//       >
//         <span className="visually-hidden">Loading...</span>
//       </div>
//       <p className="mt-3 fw-semibold" style={{ color: "#3A5FBE" }}>
//         Loading ...
//       </p>
//     </div>
//   );
// }


//   if (error) return <p className="text-danger text-center mt-3">{error}</p>;

//   // Render employee profile if viewEmployee is set
//   if (viewEmployee) {
//     return (
//       <EmployeeProfileForAdmin
//         employee={viewEmployee}
//         onBack={() => setViewEmployee(null)}
//       />
//     );
//   }


//   return (

//     <div className="container p-4">
//       <h4 className="mb-3" style={{ color: "#3A5FBE", fontSize: "25px" }}>All Employee Details</h4>
//       {/* <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
//         ⬅ Back
//       </button> */}

//       {userRole === "admin" && <AddEmployee />}

//       <div className="table-responsive mt-2">
//         <table className="table table-hover mb-0" style={{ borderCollapse: "collapse" }}>
//           <thead style={{ backgroundColor: "#f8f9fa" }}>
//             <tr>
//               <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px' }}>Name</th>
//               <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px' }}>Email</th>
//               <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px' }}>Department</th>
//               <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px' }}>Position</th>
//               <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px' }}>Date Of Joining</th>
//               <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px' }}>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentEmployees.map((emp) => (
//               <tr key={emp._id}>
//                 <td>{emp.name}</td>
//                 <td>{emp.email}</td>
//                 <td>{emp.department || "N/A"}</td>
//                 <td className="text-capitalize">{emp.role}</td>
//                 <td>{new Date(emp.doj || emp.createdAt).toLocaleDateString()}</td>
//                 <td style={{ display: "flex", gap: "5px" }}>
//                   {userRole === "admin" && (
//                     <button
//                       className="btn btn-sm btn-danger"
//                       onClick={() => handleDeleteEmployee(emp._id)}
//                     >
//                       soft Delete
//                     </button>

//                   )}
//                   {userRole === "admin" && (
//                     <button
//                       className="btn btn-sm btn-danger"
//                       onClick={() => handleDeleteEmployeepermanent(emp._id)}
//                     >
//                       Delete
//                     </button>
//                   )}

//                   {/* <button
//                     className="btn btn-sm"
//                     style={{ backgroundColor: "#3A5FBE", color: "#fff" }}
//                     onClick={() => setViewEmployee(emp)}
//                   >
//                     View
//                   </button> */}

//                   <NavLink
//   to={`/dashboard/${role}/${username}/${id}/employeeprofile/${emp._id}`}
//   className="btn btn-sm"
//   style={{ backgroundColor: "#3A5FBE", color: "#fff" }}
// >
//   View
// </NavLink>


//                   {/* <button
//                       className="btn btn-sm btn-primary"
//                     onClick={() => handleAssignManagerClick(emp)}
//                   >
//                     Assign Manager
//                   </button> */}
//                   {userRole === "admin" && (
//                     <button
//                       className="btn btn-sm"
//                       style={{ backgroundColor: "#3A5FBE", color: "#fff" }}
//                       onClick={() => handleAssignManagerClick(emp)}

//                     >
//                       Assign Manager
//                     </button>
//                   )}

//                   {/* {emp.reportingManager && (
//                     <p className="mt-1 mb-0 text-muted">
//                       Current: {emp.reportingManager.name} - {emp.reportingManager.designation}
//                     </p>
//                   )} */}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Custom Pagination */}
//       <nav className="d-flex align-items-center justify-content-end mt-3 text-muted">
//         <div className="d-flex align-items-center gap-3">
//           {/* Rows per page dropdown */}
//           <div className="d-flex align-items-center">
//             <span style={{ fontSize: '14px', marginRight: '8px' }}>Rows per page:</span>
//             <select
//               className="form-select form-select-sm"
//               style={{ width: 'auto', fontSize: '14px' }}
//               value={itemsPerPage}
//               onChange={(e) => {
//                 setItemsPerPage(Number(e.target.value));
//                 setCurrentPage(1);
//               }}
//             >
//               <option value={5}>5</option>
//               <option value={10}>10</option>
//               <option value={25}>25</option>
//             </select>
//           </div>

//           {/* Page range display */}
//           <span style={{ fontSize: '14px', marginLeft: '16px' }}>
//             {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, employees.length)} of {employees.length}
//           </span>

//           {/* Navigation arrows */}
//           <div className="d-flex align-items-center" style={{ marginLeft: '16px' }}>
//             <button
//               className="btn btn-sm border-0"
//               onClick={() => handlePageChange(currentPage - 1)}
//               disabled={currentPage === 1}
//               style={{ fontSize: '18px', padding: '2px 8px' }}
//             >
//               ‹
//             </button>
//             <button
//               className="btn btn-sm border-0"
//               onClick={() => handlePageChange(currentPage + 1)}
//               disabled={currentPage === totalPages}
//               style={{ fontSize: '18px', padding: '2px 8px' }}
//             >
//               ›
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* Modal for assigning manager */}
//       {showModal && (
//         <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
//           <div className="modal-dialog modal-dialog-centered">
//             <div className="modal-content">
//               <div className="modal-header" style={{ backgroundColor: "#233986", borderColor: "#233986", color: "#fff" }}>
//                 <h5 className="modal-title">Assign Reporting Manager</h5>
//                 <button
//                   type="button"
//                   className="btn-close btn-close-white"
//                   onClick={() => setShowModal(false)}
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 {message && <div className="alert alert-info">{message}</div>}
//                 <div className="mb-3">
//                   <label style={{ color: "#0d47a1", fontWeight: "bold" }}>Manager</label>
//                   <select
//                     className="form-select mt-2"
//                     value={selectedManagerId}
//                     onChange={(e) => setSelectedManagerId(e.target.value)}
//                   >
//                     <option value="">Select Manager</option>
//                     {managersList.map((m) => (
//                       <option key={m._id} value={m._id}>
//                         {m.name} - {m.designation} ({m.email})
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="d-flex justify-content-end gap-2">
//                   <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)}
//                     style={{ borderColor: "#233986", color: "#233986", fontWeight: "bold" }}>
//                     Cancel
//                   </button>
//                   <button className="btn btn-primary" onClick={handleUpdateManager}
//                     style={{ backgroundColor: "#233986", borderColor: "#233986", color: "#fff" }}>
//                     Assign
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

// <div className="text-end mt-3">
//        <button
//   className="btn btn-primary mt-3"
//   style={{ backgroundColor: "#3A5FBE", borderColor: "#3A5FBE" }}
//   onClick={() => window.history.go(-1)}
// >
//   Back
// </button>
// </div>

//     </div>
//   );
// }

// export default AllEmployeeDetails;















import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import EmployeeProfileForAdmin from "./EmployeeMyProfileForAdmin";
import AddEmployee from "../LoginRegistration/AddEmployee";

function AllEmployeeDetails() {
  const [employees, setEmployees] = useState([]);
  const [oldEmployees, setOldEmployees] = useState([]); // Deleted employees
  const [managersList, setManagersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedManagerId, setSelectedManagerId] = useState("");
  const [message, setMessage] = useState("");
  const [viewEmployee, setViewEmployee] = useState(null);

  const [showOldEmployees, setShowOldEmployees] = useState(false);

  const userRole = localStorage.getItem("role");
  const { role, username, id } = useParams();

  //Rutuja code for serch bar
  const [searchName, setSearchName] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const handleSearch = () => {
    if (!searchName.trim()) {
      const displayedList = showOldEmployees ? oldEmployees : employees;
      setFilteredEmployees(displayedList);
      setCurrentPage(1);
      return;
    }

    const listToSearch = showOldEmployees ? oldEmployees : employees;
    const filtered = listToSearch.filter(emp =>
      emp.name?.toLowerCase().includes(searchName.toLowerCase())
    );
    setFilteredEmployees(filtered);
    setCurrentPage(1);
  };

  const handleResetSearch = () => {
    setSearchName("");
    const displayedList = showOldEmployees ? oldEmployees : employees;
    setFilteredEmployees(displayedList);
    setCurrentPage(1);
  };

  const toggleOldEmployees = () => {
    const newShowOldEmployees = !showOldEmployees;
    setShowOldEmployees(newShowOldEmployees);

    const newList = newShowOldEmployees ? oldEmployees : employees;
    setFilteredEmployees(newList);
    setCurrentPage(1);
    setSearchName(""); // Reset search when switching views
  };
// code end rutuja

  // Soft delete
  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`https://cws-server.vercel.app/soft/deleteEmployee/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove from active list and push to deleted list
      const deletedEmp = employees.find((emp) => emp._id === id);
      setEmployees((prev) => prev.filter((emp) => emp._id !== id));
      setOldEmployees((prev) => [...prev, deletedEmp]);
      setFilteredEmployees(displayedList);
      alert("Employee soft deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Error deleting employee. Please try again.");
    }
  };

  // Permanent delete
  const handleDeleteEmployeepermanent = async (id) => {
    if (
      !window.confirm(
        "⚠️ Are you sure you want to permanently delete this employee? This action cannot be undone."
      )
    )
      return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.delete(`https://cws-server.vercel.app/deleteEmployee/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setEmployees((prev) => prev.filter((emp) => emp._id !== id));
        setOldEmployees((prev) => prev.filter((emp) => emp._id !== id));
        alert("Employee permanently deleted!");
      } else {
        alert("Failed to delete employee.");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Server error while deleting employee.");
    }
  };

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const navigate = useNavigate();

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get("https://cws-server.vercel.app/getAllEmployees", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const all = res.data || [];
        const active = all.filter((e) => e.isDeleted !== true);
        // const deleted = all.filter((e) => e.isDeleted === true);
        const deleted = all.filter((e) => e.isDeleted === true);
        setOldEmployees(deleted);
        setFilteredEmployees(active);
        setEmployees(active);
        setOldEmployees(deleted);

        console.log("Deleted Employees:", deleted);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch employees.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);
  
  
  // Assign Manager
  const handleAssignManagerClick = (emp) => {
    console.log("hii",emp)
    setSelectedEmployee(emp);
    setSelectedManagerId(emp.reportingManager?._id || "");
    const managers = employees.filter(
      (e) => e.role === "manager" && e._id !== emp._id
    );
    setManagersList(managers);
    setShowModal(true);
    setMessage("");
  };

  const handleUpdateManager = async () => {
    if (!selectedManagerId) {
      setMessage("Please select a manager.");
      return;
    }
    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(
        `https://cws-server.vercel.app/users/${selectedEmployee._id}/assign-manager`,
        { managerId: selectedManagerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const managerObj = managersList.find((m) => m._id === selectedManagerId);
      setEmployees((prev) =>
        prev.map((emp) =>
          emp._id === selectedEmployee._id
            ? { ...emp, reportingManager: managerObj }
            : emp
        )
      );
      setFilteredEmployees((prev) =>
        prev.map((emp) =>
          emp._id === selectedEmployee._id
            ? { ...emp, reportingManager: managerObj }
            : emp
        )
      );
      setMessage("Manager assigned successfully!");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setMessage("Error assigning manager.");
    }
  };

  // Pagination with filtered data
  const displayedList = filteredEmployees ;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = displayedList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayedList.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (loading)
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-grow" role="status" style={{ width: "4rem", height: "4rem", color: "#3A5FBE" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 fw-semibold" style={{ color: "#3A5FBE" }}>
          Loading ...
        </p>
      </div>
    );

  if (error) return <p className="text-danger text-center mt-3">{error}</p>;

  return (
    <div className="container p-4">
      <h4 className="mb-3" style={{ color: "#3A5FBE", fontSize: "25px" }}>
        All Employee Details
      </h4>

      {/* {userRole === "admin" && <AddEmployee />} */}

      {/* Toggle Button for Old Employees */}
      {/* <div className="text-end mb-3">
        <button
          className="btn btn-secondary"
          onClick={() => {
            setShowOldEmployees(!showOldEmployees);
            setCurrentPage(1);
          }}
        >
          {showOldEmployees ? "Show Active Employees" : "Show Old Employees"}
        </button>
      </div> */}
      


      {userRole === "admin" && (
        <div className="d-flex justify-content-between align-items-center mb-3">

          {/* Add Employee Component (Button Inside) */}
          <AddEmployee />

          {/* Show Old Employees Button */}
          <button
            className="btn btn-sm custom-outline-btn"
            style={{ minWidth: 90 }}
            onClick={toggleOldEmployees}
          >
            {showOldEmployees ? "Show Active Employees" : "Show Old Employees"}
          </button>

        </div>
      )}



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

      <div className="fg-row">
          <label className="fg-label">Search by Name</label>
          <input
            type="text"
            className="fg-input"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Enter employee name..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>

        {/* Empty column for alignment */}
        <div className="fg-row">
          <div></div>
          <div></div>
        </div>

        {/* Actions */}
        <div className="fg-actions">
          <button 
            className="btn btn-sm custom-outline-btn"
            style={{ minWidth: 90 }}
            onClick={handleSearch}
          >
            Search
          </button>
          <button
            className="btn btn-sm custom-outline-btn"
            style={{ minWidth: 90 }}
            onClick={handleResetSearch}
          >
            Reset
          </button>
        </div>
      </div>


      <div className="table-responsive mt-2">
        <table className="table table-hover mb-0">
          <thead style={{ backgroundColor: "#f8f9fa" }}>
            <tr>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>ID</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Name</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Email</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Department</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }} >Position</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Date Of Joining</th>
              <th style={{ fontWeight: '500', fontSize: '14px', color: '#6c757d', borderBottom: '2px solid #dee2e6', padding: '12px', whiteSpace: 'nowrap' }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {currentEmployees.map((emp) => (
              <tr key={emp._id}>

                <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{emp.employeeId?.slice(0, 9)}</td>
                <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{emp.name}</td>
                <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{emp.email}</td>
                <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{emp.department || "N/A"}</td>
                <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }} className="text-uppercase">{emp.role}</td>
                <td style={{ padding: '12px', verticalAlign: 'middle', fontSize: '14px', borderBottom: '1px solid #dee2e6', whiteSpace: 'nowrap' }}>{new Date(emp.doj || emp.createdAt).toLocaleDateString()}</td>

                <td style={{ display: "flex", gap: "5px" }}>

                  

                   <NavLink
                    to={`/dashboard/${role}/${username}/${id}/employeeprofile/${emp._id}`}
                    className="btn btn-sm custom-outline-btn"
                  >
                    View
                  </NavLink>




                    {!showOldEmployees && userRole === "admin" && (
                    <button
                      className="btn btn-sm btn-outline-success me-2"
                      style={{
                        whiteSpace: "nowrap",
                        height: "31px",         // Same as Bootstrap btn-sm default
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        //  backgroundColor: "#3A5FBE", color: "#fff"
                      }} onClick={() => handleAssignManagerClick(emp)}
                    >
                      Assign Manager
                    </button>
                  )}




                  {/* Hide delete buttons on Old Employee view */}
                  {!showOldEmployees && userRole === "admin" && (
                    <button className="btn btn-sm btn-outline-danger" style={{
                      whiteSpace: "nowrap",
                      height: "31px",         // Same as Bootstrap btn-sm default
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }} onClick={() => handleDeleteEmployee(emp._id)}>
                      Move To Bin
                    </button>
                  )}

                  {showOldEmployees && userRole === "admin" && (
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteEmployeepermanent(emp._id)}>
                      Delete
                    </button>
                  )}

                 

                
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <nav className="d-flex align-items-center justify-content-end mt-3 text-muted">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center">
            <span style={{ fontSize: "14px", marginRight: "8px" }}>Rows per page:</span>
            <select
              className="form-select form-select-sm"
              style={{ width: "auto" }}
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

          <span style={{ fontSize: "14px" }}>
            {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, displayedList.length)} of{" "}
            {displayedList.length}
          </span>

          <div className="d-flex align-items-center">
            <button
              className="btn btn-sm border-0"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹
            </button>
            <button
              className="btn btn-sm border-0"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        </div>
      </nav>








     {/* Modal for assigning manager */}
   

   {showModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: "#233986", borderColor: "#233986", color: "#fff" }}>
                <h5 className="modal-title">Assign Reporting Manager</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {message && <div className="alert alert-info">{message}</div>}
                <div className="mb-3">
                  <label style={{ color: "#0d47a1", fontWeight: "bold" }}>Manager</label>
                  <select
                    className="form-select mt-2"
                    value={selectedManagerId}
                    onChange={(e) => setSelectedManagerId(e.target.value)}
                  >
                    <option value="">Select Manager</option>
                    {managersList.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} - {m.role} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button className="btn btn-outline-secondary" onClick={() => setShowModal(false)}
                    style={{ borderColor: "#233986", color: "#233986", fontWeight: "bold" }}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleUpdateManager}
                    style={{ backgroundColor: "#233986", borderColor: "#233986", color: "#fff" }}>
                    Assign
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}










      {/* Back Button */}
      <div className="text-end mt-3">
        <button
          className="btn btn-sm custom-outline-btn"
          style={{ minWidth: 90 }}
          onClick={() => window.history.go(-1)}
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default AllEmployeeDetails;


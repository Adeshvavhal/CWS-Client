import React, { useState, useEffect } from "react";
import { useNavigate, useParams, NavLink, Routes, Route } from "react-router-dom";
import axios from "axios";
import AdminDashboard from "./AdminDashboard";
import HRDashboard from './HRDashboard'
import EmployeeDashbord from './EmployeeDashbord'
import AllEmployeeDetails from "../OnlyForAdmin/AllEmployeeList";
import TodaysEmployeeDetails from "../OnlyForAdmin/TodaysEmployeeDetails";
import AllEventsCards from "../Events/AllEventCards";
import AllHolidays from "../Holidays/AllHolidays";
import Header from "./Header";
import Sidebar from "./Sidebar";
import AddEmployee from "../LoginRegistration/AddEmployee";
import AdminAddLeaveBalance from "../Leaves/AdminAddLeaveBalance";
import "bootstrap/dist/css/bootstrap.min.css";
import "./dashboard.css"
import {
  HouseDoorFill,
  PersonLinesFill,
  CalendarCheckFill,
  FileEarmarkTextFill,
  CalendarEventFill,
  BarChartFill,
  GearFill,
} from "react-bootstrap-icons";
import EmployeeLeaveBalance from "../Leaves/EmployeeLeaveBalance";
import ApplyRegularization from "../Regularizations/ApplyRegularization";
import AllEmployeeRegularizationRequestForAdmin from "../Regularizations/AllEmployeeRegularizationRequestForAdmin";
import AllRequest from "../All/AllRequest";
import MyProfile from "./MyProfile";
import MyAttendance from "../MyAttendance";
import AdminSetting from "../OnlyForAdmin/AdminSetting";
import EmployeeSettings from "../OnlyForAdmin/EmployeeSettings";
import EventsAndHolidaysDashboard from "../Events/EventsAndHolidaysDashboard";
import ManagerDashboard from "./ManagerDashboard";
import EmployeeMyProfileForAdmin from "../OnlyForAdmin/EmployeeMyProfileForAdmin";
import EmployeeFullAttendance from "../OnlyForAdmin/EmployeeFullAttendace";
import HrAdminLeavebalance from "./HrAdminLeavebalance";

function Dashboard() {
  const { role, username, id } = useParams();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false); // 🧩 spinner state

  console.log("Dashboard rendered");

  useEffect(() => {
    const isInvalid =
      !role || !username || !id ||
      ["null", "undefined"].includes(role) ||
      ["null", "undefined"].includes(username) ||
      ["null", "undefined"].includes(id);

    if (isInvalid) {
      console.warn("⚠️ Invalid session detected. Logging out...");
      localStorage.clear();
      sessionStorage.clear();

      // ✅ Navigate once only
      if (window.location.pathname !== "/login") {
        navigate("/login", { replace: true });
      }
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    let isMounted = true;
    axios
      .get("https://cws-server.vercel.app/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (isMounted) setUser(res.data);
      })
      .catch((err) => {
        console.error("Token check failed:", err?.response?.status);
        localStorage.clear();
        sessionStorage.clear();
        if (isMounted) navigate("/login", { replace: true });
      });

    return () => {
      isMounted = false;
    };
  }, []);
  //role, username, id, navigate

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(`https://cws-server.vercel.app/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
      });
  }, [navigate]);


  // in Dashboard or Header where logout is triggered
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const refreshToken = localStorage.getItem("refreshToken");
      // call backend to invalidate refresh token (optional)
      await axios.post("https://cws-server.vercel.app/logout", { refreshToken });

      // clear everything
      // ❗ Clear active browser session
      // sessionStorage.removeItem("activeUser");
      // ❗ Clear localStorage tokens
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      localStorage.removeItem("id");

      //    // Notify all tabs
      // const bc = new BroadcastChannel("auth");
      // bc.postMessage({ type: "LOGOUT" });

      // optionally clear other app state...

      // update a top-level indicator if you use context or store
      // (not required if App reads localStorage)
      // navigate once after clearing
      // Give time for spinner before redirect
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 800);
    } catch (err) {
      console.error("Logout error:", err);
      // still clear local state and navigate
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      localStorage.removeItem("id");
      navigate("/login", { replace: true });
    } finally {
      // optional spinner stop (navigate will mount login)
      setIsLoggingOut(false);
    }
  };

  if (!user)
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div
          className="spinner-grow text-primary"
          role="status"
          style={{ width: "4rem", height: "4rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 fw-semibold text-primary">Loading...</p>
      </div>
    );


  const dashboards = {
    admin: <AdminDashboard user={user} role={role} />,
    ceo: <AdminDashboard user={user} role={role} />,
    employee: <EmployeeDashbord user={user} />,
    hr: <EmployeeDashbord user={user} />,
    manager: <EmployeeDashbord user={user} />,
  };

console.log("user",user)
  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar handleLogout={handleLogout} />
      {/* Main content */}
      <div className="main-content-wrapper">
        <Header user={user} handleLogout={handleLogout} />
        <div className="main-container">
          <Routes>
            <Route path="" element={dashboards[role]} />
            <Route
              path="leavebalance"
              element={
                user.role === "admin" || user.role === "ceo" //|| user.role === "hr"
                  ? <AdminAddLeaveBalance user={user} />
                  : <EmployeeLeaveBalance user={user} />
              }
            />
            {/* /hr-core-dashboard */}
            {/* <Route
              path="/hr-core-dashboard"
              element={
                user.role === "hr"  //|| user.role === "hr"
                  ? <HRDashboard user={user} />
                  : null
              }
            /> */}
            {/* hr-leavebalance */}
            <Route
              path="/hr-leavebalance"
              element={
                user.role === "hr"  //|| user.role === "hr"
                  ? <HrAdminLeavebalance user={user} />
                  : null
              }
            />

            <Route
              path="/hr-employee-regularization"
              element={
                user.role === "hr"  //|| user.role === "hr"
                  ? <AllEmployeeRegularizationRequestForAdmin user={user} />
                  : null
              }
            />
            <Route
              path="/hr-core-dashboard"
              element={
                user.role === "admin" || user.role === "ceo" || user.role === "hr" ? (
                  <HRDashboard user={user} />
                ) : (
                  <h5 className="text-center mt-4 text-danger">
                    Access Denied: Admins Only
                  </h5>
                )
              }
            />


            {/* manager-core-dashboard */}
            <Route
              path="/manager-core-dashboard"
              element={
                user.role === "manager"  //|| user.role === "hr"
                  ? <ManagerDashboard user={user} />
                  : null
              }
            />
            <Route path="allemployeedetails" element={<AllEmployeeDetails />} />
            {/* <Route path="employeeprofile" element={<EmployeeMyProfileForAdmin />} /> */}
            <Route
              path="employeeprofile/:empId"
              element={
                user.role === "admin" || user.role === "ceo" || user.role === "hr" ? (
                  <EmployeeMyProfileForAdmin />
                ) : (
                  <h5 className="text-center mt-4 text-danger">
                    Access Denied: Admins Only
                  </h5>
                )
              }
            />

            <Route path="addemployee" element={<AddEmployee />} />
            <Route path="myprofile" element={<MyProfile user={user} />} />
            {/* <Route path="regularization" element={<ApplyRegularization user={user}/>} /> */}
            {/* AllEmployeeRegularizationRequestForAdmin */}

            <Route
              path="regularization"
              element={
                user.role === "admin" || user.role === "ceo" //|| user.role === "hr"
                  ? <AllEmployeeRegularizationRequestForAdmin user={user} />
                  : <ApplyRegularization user={user} />
              }
            />
            <Route path="allRequest" element={<AllRequest />} />
            <Route path="TodaysAttendanceDetails" element={<TodaysEmployeeDetails />} />
            <Route path="AllEvents" element={<AllEventsCards />} />
            <Route path="AllEventsandHolidays" element={<EventsAndHolidaysDashboard />} />
            {/* <Route path="AllHolidays" element={<AllHolidays />} /> */}
            {/* <Route path="MyAttendance" element={<MyAttendance employeeId={user._id}/>} /> */}
            {/* <Route
              path="employee"
              element={
                user.role === "ceo"
                  ? <AllEmployeeDetails />
                  : <MyAttendance employeeId={user._id} />
              }
            /> */}


            // Assuming `user` is available (from context, Redux, or props)
            <Route
              path="employee"
              element={
                user.role === "employee" || user.role === "hr" || user.role === "manager" // employee roles
                  ? <MyAttendance employeeId={user._id} />
                  : user.role === "ceo" || user.role === "admin"  // admin roles
                    ? <TodaysEmployeeDetails />
                    : <p>Access Denied</p>
              }
            />
            {user?.role === "admin" || user?.role === "ceo" ? (
              <Route path="settings" element={<AdminSetting  user={user} />} />
            ) : (
              <Route path="settings" element={<EmployeeSettings user={user} />} />
            )}

            <Route
              path="employeeattendance/:empId"
              element={
                user.role === "admin" || user.role === "ceo" || user.role === "hr" ? (
                  <EmployeeFullAttendance />
                ) : (
                  <h5 className="text-center mt-4 text-danger">
                    Access Denied: Admins Only
                  </h5>
                )
              }
            />

          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;



















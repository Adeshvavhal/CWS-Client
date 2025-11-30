import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import EmployeeVerify from "./assets/LoginRegistration/EmployeeVerify";
import AddEmployee from "./assets/LoginRegistration/AddEmployee";
import Login from "./assets/LoginRegistration/Login";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "./assets/AllDashboards/Dashboard";
import PasswordReset from "./assets/LoginRegistration/PasswordReset";
import ForgotPassword from "./assets/LoginRegistration/ForgotPassword";
import BackButton from "./BackButton";
import React,{useEffect} from "react";
import  "./App.css"
function App() {
  console.log("App rendered");

  useEffect(() => {
  const bc = new BroadcastChannel("auth");

  bc.onmessage = (event) => {
    if (event.data.type === "LOGOUT") {
      // sessionStorage.removeItem("activeUser");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
  };

//  return () => bc.close();
}, []);


  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/employee/verify/:id/:token" element={<EmployeeVerify />} />
        <Route path="/forgotpassword/:id/:token" element={<ForgotPassword />} />
        <Route path="/password-reset" element={<PasswordReset />} />

        {/* Protected Route */}
        <Route
          path="/dashboard/:role/:username/:id/*"
          element={
            <ProtectedRoute allowedRoles={["admin", "employee", "manager", "hr","ceo"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 or fallback route */}
        <Route
          path="*"
          element={
            <div style={{ textAlign: "center", marginTop: "50px" }}>
              <h1>404 - Page Not Found</h1>
              <p>The page you are looking for doesn't exist.</p>
              <a href="/login" style={{ color: "#007bff" }}>Go to Login</a><br/>
              <BackButton />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import axios from "axios";
import MyProfile from "../AllDashboards/MyProfile"

function EmployeeSettings({ user }) {
const [activeTab, setActiveTab] = useState("password");
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");



  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    const { currentPassword, newPassword, confirmPassword } = passwords;

    // 🔹 Basic required checks
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }

    // 🔹 New != current
    if (newPassword === currentPassword) {
      setPasswordError("New password cannot be the same as current password.");
      return;
    }

    // 🔹 Confirm password match
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    // 🔹 Strength validation (min 6 chars + upper + lower + digit + special)
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-])[A-Za-z\d@$!%*?&#^()_\-]{6,}$/;

    if (!passwordRegex.test(newPassword)) {
      setPasswordError(
        "Password must be at least 6 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    try {
      setPasswordLoading(true);

      const accessToken = localStorage.getItem("accessToken"); // from your login response

      const res = await axios.post(
        "https://cws-server.vercel.app/change-password",
        {
          currentPassword,
          newPassword,
          confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setPasswordSuccess(res?.data?.message || "Password updated successfully.");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Failed to change password:", err);
      setPasswordError(
        err?.response?.data?.message || "Failed to change password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };


  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };
  return (



    <div className="container-fluid p-3 p-md-4 p-2" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div className="d-flex justify-content-center  mb-3 gap-2">
        <button
          type="button"
          className={`btn btn-sm ${activeTab === "profile" ? "btn-primary" : "btn-outline-primary"
            }`}
          style={{
            backgroundColor: activeTab === "profile" ? "#3A5FBE" : "transparent",
            borderColor: "#3A5FBE",
            color: activeTab === "profile" ? "white" : "#3A5FBE"
          }}
          onClick={() => setActiveTab("profile")}
        >
          Update Profile
        </button>

        <button
          type="button"
          className={`btn btn-sm ${activeTab === "password" ? "btn-primary" : "btn-outline-primary"
            }`}
          style={{
            backgroundColor: activeTab === "password" ? "#3A5FBE" : "transparent",
            borderColor: "#3A5FBE",
            color: activeTab === "password" ? "white" : "#3A5FBE"
          }}
          onClick={() => setActiveTab("password")}
        >
          Change Password
        </button>
      </div>


      {activeTab === "profile" && (
        <>

          <MyProfile user={user} />
        </>
      )}

      {/* Change Password - same card design */}
      {activeTab === "password" && (
        <>
          <div
            className="card shadow-sm border-0 rounded mt-4"
            style={{ maxWidth: "1200px", margin: "0 auto" }}
          >
            <div className="card-body">
              <h6 className="fw-bold text-primary mb-3">Change Password</h6>

              {passwordError && (
                <div className="alert alert-danger py-2">{passwordError}</div>
              )}

              {passwordSuccess && (
                <div className="alert alert-success py-2">{passwordSuccess}</div>
              )}

              {/* <div className="mb-3">
            <label className="form-label text-primary">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handlePasswordInputChange}
              className="form-control bg-light border-0"
              placeholder="Enter current password"
            />
          </div> */}

              <div className="mb-3 position-relative">
                <label className="form-label text-primary">Current Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword.current ? "text" : "password"}
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handlePasswordInputChange}
                    className="form-control bg-light pe-5"
                    placeholder="Enter current password"
                  />

                  <i
                    className={`bi ${showPassword.current ? "bi-eye-fill" : "bi-eye-slash-fill"}`}
                    onClick={() =>
                      setShowPassword((prev) => ({ ...prev, current: !prev.current }))
                    }
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",                // center in input
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      fontSize: "18px",
                      color: "#3A5FBE",
                    }}
                  ></i>
                </div>
              </div>

              {/* <div className="mb-3">
            <label className="form-label text-primary">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordInputChange}
              className="form-control bg-light border-0"
              placeholder="Enter new password"
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-primary">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordInputChange}
              className="form-control bg-light border-0"
              placeholder="Re-enter new password"
            />
          </div> */}

              <div className="mb-3">
                <label className="form-label text-primary">New Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword.new ? "text" : "password"}
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordInputChange}
                    className="form-control bg-light pe-5" placeholder="Enter new password"
                  />
                  <i
                    className={`bi ${showPassword.new ? "bi-eye-fill" : "bi-eye-slash-fill"}`} onClick={() =>
                      setShowPassword((prev) => ({ ...prev, new: !prev.new }))
                    }
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      fontSize: "18px",
                      color: "#3A5FBE",
                    }}
                  ></i>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-primary">Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordInputChange}
                    className="form-control bg-light pe-5" placeholder="Re-enter new password"
                  />
                  <i
                    className={`bi ${showPassword.confirm ? "bi-eye-fill" : "bi-eye-slash-fill"}`}
                    onClick={() =>
                      setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))
                    }
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",                // center in input
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      fontSize: "18px",
                      color: "#3A5FBE",
                    }}
                  ></i>
                </div>
              </div>

              <div className="text-end">
                <button
                  // className="btn btn-primary"
                  // style={{ backgroundColor: "#3A5FBE", borderColor: "#3A5FBE" }}
                  className="btn btn-sm custom-outline-btn"
                  style={{ minWidth: 90 }}
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>


          </div>
          <div className="text-end mt-3">
            <button
              // className="btn btn-primary mt-3"
              // style={{ backgroundColor: "#3A5FBE", borderColor: "#3A5FBE" }}
              style={{ minWidth: 90 }}
              className="btn btn-sm custom-outline-btn"
              onClick={() => window.history.go(-1)}
            >
              Back
            </button>
          </div>
        </>

      )}

    </div>
  );
}

export default EmployeeSettings

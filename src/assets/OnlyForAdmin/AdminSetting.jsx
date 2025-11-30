import React, { useState, useEffect } from "react";
import axios from "axios";
import OfficeLocationSetup from './OfficeLocationSetup';
import AdminWeeklyOffSetup from './AdminWeeklyOffSetup';
import { useParams } from "react-router-dom"

function AdminSetting() {
  const { id } = useParams();        // 👈 this comes from the URL /dashboard/:role/:username/:id/settings
  const adminId = id; 

  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingImage, setRemovingImage] = useState(false);
  const [activeTab, setActiveTab] = useState("officeLocation");
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

  const handleRemoveImage = async (e) => {
    e?.preventDefault?.();

    const ok = window.confirm("Are you sure you want to remove the profile image?");
    if (!ok) return;

    try {
      setRemovingImage(true);

      const res = await axios.delete(
        `http://localhost:8000/employees/${adminId}/image`   
      );

      if (res?.data?.employee) {
        setProfile(res.data.employee);
      } else {
        setFormData((prev) => ({ ...prev, image: null }));
        setProfile((prev) => ({ ...prev, image: null }));
      }
    } catch (err) {
      console.error("Failed to remove image:", err);
    } finally {
      setRemovingImage(false);
    }
  };

  // Fetch profile safely
  useEffect(() => {
    if (!adminId) {
      setError("Admin ID is missing. Cannot fetch profile.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/employees/${adminId}`);  // 👈
        setProfile(res.data);
        setFormData({
          ...res.data,
          currentAddress: res.data.currentAddress || {},
          permanentAddress: res.data.permanentAddress || {},
          bankDetails: res.data.bankDetails || {},
        });
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setError("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [adminId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // ✅ Contact number validation — only digits and max 10
    if (name === "contact") {
      if (!/^\d*$/.test(value)) return; // only numbers allowed
      if (value.length > 10) return; // limit to 10 digits
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }

    // ✅ Address restrictions for street, city, state, zip (both current & permanent)
    if (name.includes("Address.")) {
      const key = name.split(".")[1];
      if (["street", "city", "state"].includes(key)) {
        if (!/^[A-Za-z\s]*$/.test(value)) return; // allow only letters
      }
      if (key === "zip") {
        // Only numbers and max 6 digits while typing
        if (!/^\d*$/.test(value)) return;
        if (value.length > 6) return;
      }
    }

    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else if (name.startsWith("currentAddress.")) {
      setFormData((prev) => ({
        ...prev,
        currentAddress: { ...prev.currentAddress, [name.split(".")[1]]: value },
      }));
    } else if (name.startsWith("permanentAddress.")) {
      setFormData((prev) => ({
        ...prev,
        permanentAddress: { ...prev.permanentAddress, [name.split(".")[1]]: value },
      }));
    } else if (name.startsWith("bankDetails.")) {
      setFormData((prev) => ({
        ...prev,
        bankDetails: { ...prev.bankDetails, [name.split(".")[1]]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    if (!adminId) return alert("Invalid admin ID");

    // 🧩 Contact validation — must be exactly 10 digits
    if (!/^\d{10}$/.test(formData.contact || "")) {
      alert("Contact number must be exactly 10 digits.");
      return;
    }

    // ✅ ZIP code validation — both current & permanent must be exactly 6 digits if present
    const currentZip = formData.currentAddress?.zip || "";
    const permanentZip = formData.permanentAddress?.zip || "";

    if (
      (currentZip && !/^\d{6}$/.test(currentZip)) ||
      (permanentZip && !/^\d{6}$/.test(permanentZip))
    ) {
      alert("ZIP code must be exactly 6 digits.");
      return;
    }

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        if (["currentAddress", "permanentAddress", "bankDetails"].includes(key)) {
          data.append(key, JSON.stringify(formData[key]));
        } else if (
          ["image", "panCardPdf", "aadharCardPdf", "appointmentLetter", "passbookPdf"].includes(key)
        ) {
          if (formData[key] instanceof File) data.append(key, formData[key]);
        } else if (formData[key] !== undefined && formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      await axios.put(`http://localhost:8000/employees/${adminId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Profile updated successfully!");
      setIsEditing(false);

      // Refresh profile
      const updated = await axios.get(`http://localhost:8000/employees/${adminId}`);
      setProfile(updated.data);
      setFormData({
        ...updated.data,
        currentAddress: updated.data.currentAddress || {},
        permanentAddress: updated.data.permanentAddress || {},
        bankDetails: updated.data.bankDetails || {},
      });
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  const renderFileLink = (file) => {
    if (!file) return "Not uploaded";
    if (file instanceof File) return file.name;
    return (
      <a href={`http://localhost:8000/uploads/${file}`} target="_blank" rel="noreferrer">
        View PDF
      </a>
    );
  };

  // 🌀 Show loading spinner while fetching
  if (loading && activeTab === "updateProfile")
    return (
      <div className="container-fluid p-3 p-md-4 p-2" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        <div className="d-flex justify-content-center flex-wrap mb-3 gap-2">
          {["officeLocation", "weeklyOff", "updateProfile", "changePassword"].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`btn btn-sm ${activeTab === tab ? "btn-primary" : "btn-outline-primary"}`}
              style={{
                backgroundColor: activeTab === tab ? "#3A5FBE" : "transparent",
                borderColor: "#3A5FBE",
                color: activeTab === tab ? "white" : "#3A5FBE",
                minWidth: "140px"
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "officeLocation" ? "Set Office Location" :
               tab === "weeklyOff" ? "Set Weekly Off" :
               tab === "updateProfile" ? "Update Profile" : "Change Password"}
            </button>
          ))}
        </div>
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ minHeight: "50vh" }}
        >
          <div
            className="spinner-grow"
            role="status"
            style={{ width: "4rem", height: "4rem", color: "#3A5FBE" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 fw-semibold" style={{ color: "#3A5FBE" }}>
            Loading profile...
          </p>
        </div>
      </div>
    );

  // ❌ Show error message
  if (error && activeTab === "updateProfile")
    return (
      <div className="container-fluid p-3 p-md-4 p-2" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        <div className="d-flex justify-content-center flex-wrap mb-3 gap-2">
          {["officeLocation", "weeklyOff", "updateProfile", "changePassword"].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`btn btn-sm ${activeTab === tab ? "btn-primary" : "btn-outline-primary"}`}
              style={{
                backgroundColor: activeTab === tab ? "#3A5FBE" : "transparent",
                borderColor: "#3A5FBE",
                color: activeTab === tab ? "white" : "#3A5FBE",
                minWidth: "140px"
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "officeLocation" ? "Set Office Location" :
               tab === "weeklyOff" ? "Set Weekly Off" :
               tab === "updateProfile" ? "Update Profile" : "Change Password"}
            </button>
          ))}
        </div>
        <div className="text-danger text-center mt-5 fw-semibold">
          {error}
        </div>
      </div>
    );

  // 🌀 Spinner if no profile found
  if (!profile && activeTab === "updateProfile")
    return (
      <div className="container-fluid p-3 p-md-4 p-2" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
        <div className="d-flex justify-content-center flex-wrap mb-3 gap-2">
          {["officeLocation", "weeklyOff", "updateProfile", "changePassword"].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`btn btn-sm ${activeTab === tab ? "btn-primary" : "btn-outline-primary"}`}
              style={{
                backgroundColor: activeTab === tab ? "#3A5FBE" : "transparent",
                borderColor: "#3A5FBE",
                color: activeTab === tab ? "white" : "#3A5FBE",
                minWidth: "140px"
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "officeLocation" ? "Set Office Location" :
               tab === "weeklyOff" ? " Set Weekly Off" :
               tab === "updateProfile" ? "Update Profile" : "Change Password"}
            </button>
          ))}
        </div>
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ minHeight: "50vh" }}
        >
          <div
            className="spinner-border"
            role="status"
            style={{ width: "3rem", height: "3rem", color: "#3A5FBE" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">No profile data available...</p>
        </div>
      </div>
    );

  const formatLabel = (label) => {
    const specialCases = {
      dob: "Date Of Birth",
      doj: "Date Of Joining",
      empId: "Employee ID",
      aadharCardPdf: "Aadhar Card",
      panCardPdf: "PAN Card",
      passbookPdf: "Bank Passbook",
      appointmentLetter: "Appointment Letter",
      casualLeaveBalance: "Casual Leave Balance",
      sickLeaveBalance: "Sick Leave Balance",
      probationMonths: "Probation Period",
      ifsc: "IFSC"
    };

    if (specialCases[label]) return specialCases[label];

    return label
      .replace(/([A-Z])/g, " $1") // space before capital letters
      .replace(/([a-z])([0-9])/g, "$1 $2") // space before numbers
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getFileType = (file) => {
    if (!file) return null;

    if (file instanceof File) {
      const mime = file.type.toLowerCase();
      const name = file.name.toLowerCase();

      if (mime === "application/pdf" || name.endsWith(".pdf")) return "pdf";
      if (mime.startsWith("image/")) return "image";
      return "other";
    }

    if (typeof file === "string") {
      const clean = file.toLowerCase();

      // Detect Cloudinary RAW PDF
      if (clean.includes("/raw/upload/")) return "pdf";

      if (clean.endsWith(".pdf")) return "pdf";
      if (/\.(jpg|jpeg|png|gif|webp)$/.test(clean)) return "image";
      return "other";
    }

    return null;
  };

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

      const accessToken = localStorage.getItem("accessToken");

      const res = await axios.post(
        "http://localhost:8000/change-password",
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
      {/* 4 Navigation Buttons */}
      <div className="d-flex justify-content-center flex-wrap mb-3 gap-2">
        {["officeLocation", "weeklyOff", "updateProfile", "changePassword"].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`btn btn-sm ${activeTab === tab ? "btn-primary" : "btn-outline-primary"}`}
            style={{
              backgroundColor: activeTab === tab ? "#3A5FBE" : "transparent",
              borderColor: "#3A5FBE",
              color: activeTab === tab ? "white" : "#3A5FBE",
              minWidth: "140px"
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "officeLocation" ? "Set Office Location" :
             tab === "weeklyOff" ? "Set Weekly Off" :
             tab === "updateProfile" ? "Update Profile" : "Change Password"}
          </button>
        ))}
      </div>

      {/* Office Location Tab */}
      {activeTab === "officeLocation" && (
        <OfficeLocationSetup />
      )}

      {/* Weekly Off Tab */}
      {activeTab === "weeklyOff" && (
        <AdminWeeklyOffSetup />
      )}

      {/* Update Profile Tab */}
      {activeTab === "updateProfile" && profile && (
        <div className="card shadow-sm border-0 rounded" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header: Image + Name + Buttons */}
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between p-2 p-md-3 gap-3">
            <div className="d-flex flex-column flex-md-row align-items-center gap-2 gap-md-3 w-100 w-md-auto">
              <div className="d-flex flex-column align-items-center text-center">
                <label className="form-label fw-semibold text-primary mb-2">Profile Image</label>

                {/* Show image first */}
                {formData.image instanceof File ? (
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="Profile Preview"
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginBottom: "5px",
                    }}
                  />
                ) : profile.image ? (
                  <>
                    <img
                      src={profile.image?.startsWith("http")
                        ? profile.image
                        : `http://localhost:8000/image/${profile.image}`}
                      alt="Profile"
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginBottom: "5px",
                      }}
                    />
                  </>
                ) : (
                  <img
                    src={"/myprofile.jpg"}
                    alt="Profile"
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginBottom: "5px",
                    }}
                  />
                )}

                {/* File input below the image in edit mode */}
                {isEditing && (
                  <>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleChange}
                      className="form-control form-control-sm bg-light border-0 mt-2"
                      style={{ maxWidth: "250px" }}
                    />

                    {/* Show selected file name or message */}
                    {formData.image instanceof File ? (
                      <p className="text-muted small mb-0 mt-1">Selected: {formData.image.name}</p>
                    ) : (
                      <p className="text-muted small mb-0 mt-1">No image selected</p>
                    )}

                    <div style={{ marginTop: 8 }}>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm mt-2"
                        onClick={handleRemoveImage}
                        disabled={removingImage}
                      >
                        {removingImage ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  </>
                )}
              </div>

              <h4 className="mb-0" style={{ textTransform: "capitalize" }}>{profile.name}</h4>
            </div>

            <div className="d-flex gap-2">
              {!isEditing ? (
                <button
                  style={{ minWidth: 90 }}
                  className="btn btn-sm custom-outline-btn"
                  onClick={() => setIsEditing(true)}>
                  Edit
                </button>
              ) : (
                <>
                  <button
                    style={{ minWidth: 90 }}
                    className="btn btn-sm custom-outline-btn"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                  <button
                    style={{ minWidth: 90 }}
                    className="btn btn-sm custom-outline-btn"
                    onClick={() => {
                      setFormData(profile);
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="card-body">
            {/* Personal Details */}
            <h6 className="fw-bold text-primary mb-3">Personal Details</h6>

            <div className="row g-3">
              {[
                "employeeId",
                "name",
                "email",
                "contact",
                "gender",
                "maritalStatus",
                "department",
                "designation",
                "role",
                "salary",
              ].map((field) => {
                const formatLabel = (text) =>
                  text
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())
                    .trim();

                return (
                  <div key={field} className="col-md-6">
                    <label className="form-label" style={{ color: "#007BFF" }}>
                      {formatLabel(field)}
                    </label>

                    {isEditing ? (
                      <input
                        type={field === "salary" ? "number" : "text"}
                        name={field}
                        value={formData[field] || ""}
                        onChange={handleChange}
                        className={`form-control border-0 ${[
                          "employeeId",
                          "name",
                          "email",
                          "gender",
                          "department",
                          "designation",
                          "role",
                          "salary",
                          "maritalStatus",
                        ].includes(field)
                          ? "bg-secondary-subtle text-muted"
                          : "bg-light"
                          }`}
                        placeholder={formatLabel(field)}
                        readOnly={[
                          "employeeId",
                          "name",
                          "email",
                          "gender",
                          "department",
                          "designation",
                          "role",
                          "salary",
                          "maritalStatus",
                        ].includes(field)}
                      />
                    ) : (
                      <div
                        className="form-control bg-light border-0"
                        style={{
                          textTransform: field === "email" ? "none" : "capitalize",
                        }}
                      >
                        {profile[field] || "-"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* DOB & DOJ */}
            <div className="row g-3 mt-3">
              {["dob", "doj"].map((field) => (
                <div key={field} className="col-md-6">
                  <label className="form-label" style={{ color: "#007BFF" }}>
                    {formatLabel(field)}
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name={field}
                      value={formData[field] ? formData[field].split("T")[0] : ""}
                      onChange={handleChange}
                      className={`form-control border-0 ${["dob", "doj"].includes(field)
                        ? "bg-secondary-subtle text-muted"
                        : "bg-light"
                        }`}
                      readOnly={["dob", "doj"].includes(field)}
                    />
                  ) : profile[field] ? (
                    <div className="form-control bg-light border-0">
                      {new Date(profile[field]).toLocaleDateString()}
                    </div>
                  ) : (
                    "-"
                  )}
                </div>
              ))}
            </div>

            {/* Current Address */}
            <h6 className="fw-bold text-primary mt-4">Current Address</h6>
            <div className="row g-3">
              {["street", "city", "state", "zip"].map((field) => (
                <div key={field} className="col-md-6">
                  <label className="form-label text-primary">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name={`currentAddress.${field}`}
                      value={formData.currentAddress?.[field] || ""}
                      onChange={handleChange}
                      className="form-control bg-light border-0"
                    />
                  ) : (
                    <div className="form-control bg-light border-0" style={{ textTransform: "capitalize" }}>
                      {profile.currentAddress?.[field] || "-"}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Permanent Address */}
            <h6 className="fw-bold text-primary mt-4">Permanent Address</h6>
            <div className="row g-3">
              {["street", "city", "state", "zip"].map((field) => (
                <div key={field} className="col-md-6">
                  <label className="form-label text-primary">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name={`permanentAddress.${field}`}
                      value={formData.permanentAddress?.[field] || ""}
                      onChange={handleChange}
                      className={`form-control border-0 ${["street", "city", "state", "zip"].includes(field)
                        ? "bg-secondary-subtle text-muted"
                        : "bg-light"
                        }`}
                      readOnly
                    />
                  ) : (
                    <div className="form-control bg-light border-0" style={{ textTransform: "capitalize" }}>
                      {profile.permanentAddress?.[field] || "-"}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bank Details */}
            <h6 className="fw-bold text-primary mt-4">Bank Details</h6>
            <div className="row g-3">
              {["bankName", "accountNumber", "ifsc"].map((field) => (
                <div key={field} className="col-md-6">
                  <label className="form-label text-primary">{formatLabel(field)}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name={`bankDetails.${field}`}
                      value={formData.bankDetails?.[field] || ""}
                      onChange={handleChange}
                      className="form-control bg-secondary-subtle text-muted border-0"
                      readOnly
                    />
                  ) : (
                    <div className="form-control bg-light border-0">{profile.bankDetails?.[field] || "-"}</div>
                  )}
                </div>
              ))}
            </div>

            <h6 className="mt-3">Documents</h6>
            <div className="d-flex gap-4 flex-wrap">
              {[
                { field: "aadharCardPdf", label: "Aadhar Card" },
                { field: "panCardPdf", label: "PAN Card" },
                { field: "appointmentLetter", label: "Appointment Letter" },
              ].map(({ field, label }) => {
                const file = profile[field];
                const fileType = getFileType(file);

                const href = file
                  ? file.startsWith("http")
                    ? file
                    : `https://res.cloudinary.com/dfvumzr0q/raw/upload/${file}`
                  : null;

                return (
                  <div key={field} className="d-flex flex-column">
                    <label className="form-label text-primary">{label}</label>

                    {isEditing ? (
                      <input
                        type="file"
                        name={field}
                        accept=".jpg,.jpeg,.png,application/pdf"
                        onChange={handleChange}
                      />
                    ) : !file ? (
                      "-"
                    ) : (
                      <a href={href} target="_blank" rel="noopener noreferrer">
                        {fileType === "pdf" && (
                          <img src="/pdfimg.png" style={{ width: "50px" }} alt="PDF" />
                        )}
                        {fileType === "image" && (
                          <img src="/jpgimg.jpeg" style={{ width: "50px" }} alt="Image" />
                        )}
                      </a>
                    )}
                  </div>
                );
              })}

              {/* Bank Passbook */}
              <div className="d-flex flex-column">
                <label className="form-label text-primary">Bank Passbook</label>
                {isEditing ? (
                  <input
                    type="file"
                    name="passbookPdf"
                    accept=".jpg,.jpeg,.png,application/pdf"
                    onChange={handleChange}
                  />
                ) : profile.bankDetails?.passbookPdf ? (
                  (() => {
                    const file = profile.bankDetails.passbookPdf;
                    const fileType = getFileType(file);
                    const href = file.startsWith("http")
                      ? file
                      : `https://res.cloudinary.com/dfvumzr0q/raw/upload/${file}`;

                    return (
                      <a href={href} target="_blank">
                        {fileType === "pdf" && (
                          <img src="/pdfimg.png" style={{ width: "50px" }} alt="PDF" />
                        )}
                        {fileType === "image" && (
                          <img src="/jpgimg.jpeg" style={{ width: "50px" }} alt="Image" />
                        )}
                      </a>
                    );
                  })()
                ) : (
                  "-"
                )}
              </div>
            </div>

            {/* Leaves & Salary */}
            <h6 className="fw-bold text-primary mt-4">Leaves & Salary</h6>
            <div className="row g-3">
              {["casualLeaveBalance", "sickLeaveBalance", "salary", "probationMonths"].map((field) => (
                <div key={field} className="col-md-6">
                  <label className="form-label text-primary">
                    {formatLabel(field)}
                  </label>
                  {isEditing ? (
                    <input
                      type={field === "salary" ? "number" : "text"}
                      name={field}
                      value={formData[field] || ""}
                      onChange={handleChange}
                      className={`form-control border-0 ${["casualLeaveBalance", "sickLeaveBalance", "salary", "probationMonths"].includes(field)
                        ? "bg-secondary-subtle text-muted"
                        : "bg-light"
                        }`}
                      readOnly={["casualLeaveBalance", "sickLeaveBalance", "salary", "probationMonths"].includes(field)}
                    />
                  ) : (
                    <div className="form-control bg-light border-0">{profile[field] ?? "-"}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Change Password Tab */}
      {activeTab === "changePassword" && (
        <div className="card shadow-sm border-0 rounded" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="card-body">
            <h6 className="fw-bold text-primary mb-3">Change Password</h6>

            {passwordError && (
              <div className="alert alert-danger py-2">{passwordError}</div>
            )}

            {passwordSuccess && (
              <div className="alert alert-success py-2">{passwordSuccess}</div>
            )}

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
              <label className="form-label text-primary">New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword.new ? "text" : "password"}
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordInputChange}
                  className="form-control bg-light pe-5"
                  placeholder="Enter new password"
                />
                <i
                  className={`bi ${showPassword.new ? "bi-eye-fill" : "bi-eye-slash-fill"}`}
                  onClick={() =>
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
                  className="form-control bg-light pe-5"
                  placeholder="Re-enter new password"
                />
                <i
                  className={`bi ${showPassword.confirm ? "bi-eye-fill" : "bi-eye-slash-fill"}`}
                  onClick={() =>
                    setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))
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

            <div className="text-end">
              <button
                className="btn btn-sm btn-outline"
                style={{ color: "#3A5FBE", borderColor: "#3A5FBE" }}
                onClick={handleChangePassword}
                disabled={passwordLoading}
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="text-end mt-3">
        <button
          style={{ minWidth: 90 }}
          className="btn btn-sm custom-outline-btn"
          onClick={() => window.history.go(-1)}
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default AdminSetting;
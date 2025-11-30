//not responsive but working 
import React from "react";
import { NavLink } from "react-router-dom";
import Notification from "../../Notification";
import './Header.css'

function Header({ user, handleLogout }) {
  return (
    <header className="header-wrapper">
      {/* Left Side */}
      <div className="user-info" style={{ textTransform: 'capitalize' }}>
        <h2 className="user-greeting" style={{ textTransform: 'capitalize' }}>
          Hello, {user.name}
        </h2>
        <p className="user-role" style={{ textTransform: 'uppercase' }}>
          {user.role}
        </p>
      </div>

      {/* Right Side */}
      <div className="header-actions-group">
        {/* Logout Button */}
        {/* <button className="btn position-relative" onClick={handleLogout}>
          <i className="bi bi-power fs-5 text-secondary"></i>
        </button> */}

        {/* Notification Icon */}
        {/* <button className="btn position-relative">
          <i className="bi bi-bell fs-5 text-secondary"></i>
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            3
          </span>
        </button> */}
        <div className="me-2">
        <Notification userId={user._id} />
</div>
        {/* Profile Image */}
        {/* <NavLink
          to={`/dashboard/${user.role}/${user.username || user.name}/${user._id}/myprofile`}
          className="nav-link text-white d-flex flex-column align-items-center"
          id="navlink1"
        >
          <img
            src={
              user?.image
                ? ` 
 https://cws-server.vercel.app/uploads/${user.image}`
                : "/myprofile.jpg"
            }
            alt="Profile"
            className="rounded-circle border border-2 border-primary profile-img"
            width="40"
            height="40"
          />
        </NavLink> */}

        {/* Profile image with drop down option start */}

         <div className="dropdown">
            <button
              className="btn p-0"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
            <img
              // src={
              //   user?.image
              //     ?` https://cws-server.vercel.app/image/uploads/${user.image}`
              //     : "/myprofile.jpg"
              // }
               src={
    user?.image
      ? user.image.startsWith("http")
        ? user.image
        : `https://cws-server.vercel.app/uploads/${user.image}`
      : "/myprofile.jpg"
  }
              alt="Profile"
              className="rounded-circle border border-2 border-primary profile-img"
              width="40"
              height="40"
              style={{ cursor: "pointer" }}
            />
             </button>
             {/* Dropdown Section */} 
            {/* <div className="dropdown-menu profile-dropdown-menu dropdown-menu-end shadow-lg p-0" style={{ minWidth: '250px' }}> */}
             <div
  className="dropdown-menu profile-dropdown-menu dropdown-menu-start shadow-lg p-0"
  style={{ minWidth: "250px", left: 0, right: "auto" }}
>
              <div className="px-3 py-3 border-bottom bg-light">
                <div className="d-flex align-items-center mb-2">
                  <img
                    // src={
                    //   user?.image
                    //     ? ` https://cws-server.vercel.app/image/uploads/${user.image}`
                    //     : "/myprofile.jpg"
                    // }

                     src={
    user?.image
      ? user.image.startsWith("http")
        ? user.image
        : `https://cws-server.vercel.app/uploads/${user.image}`
      : "/myprofile.jpg"
  }
                    alt="Profile"
                    className="rounded-circle me-2"
                    width="40"
                    height="40"
                  />
                  <div>
                      <p className="mb-0 fw-semibold" style={{ fontSize: '14px',textTransform: "capitalize" }}>
                        {user.name}
                      </p>
                      <span 
                        className="badge bg-primary" 
                        style={{ fontSize: '10px', padding: '3px 8px', marginTop: '4px',textTransform: 'uppercase' }}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                  </div>  
                </div>
                <small className="text-muted" style={{ fontSize: '12px'}}>
                  {user.email || ''}
                </small>
              </div>
                <NavLink
                  to={`/dashboard/${user.role}/${user.username || user.name}/${user._id}/myprofile`}
                  className="dropdown-item d-flex align-items-center"
                  style={{ fontSize: '14px', textDecoration: 'none' }}
                >
                 <i className="bi fw-bold bi-person me-2" style={{ fontWeight: '900', fontSize: '16px' }}></i>
                 <span style={{ fontWeight: '600', color: '#212529' }}>View Profile</span>
              </NavLink>
              {/*  Sign Out */}
              <button
                className="dropdown-item d-flex align-items-center"
                onClick={handleLogout}
                style={{ fontSize: '14px' }}
              >
                <i className="bi fw-bold bi-box-arrow-right me-2" style={{ fontWeight: '900', fontSize: '16px' }}></i>
                <span style={{ fontWeight: '600', color: '#212529' }}>Sign Out</span>
              </button>
            </div>  
         </div>
         {/* Profile image with drop down option end */}

        {/* Employee ID */}
        <span className="fw-semibold employee-id-text" style={{color:"#3A5FBE"}}>{user.employeeId}</span>

        {/* Company Logo */}
        <img
          src="/emscwslogo.png"
          alt="Company Logo"
          className="companylogo company-logo-img"
        />
      </div>
    </header>
  );
}

export default Header;

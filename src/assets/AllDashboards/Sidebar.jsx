import React, { useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import {
  HouseDoorFill,
  PersonLinesFill,
  CalendarCheckFill,
  FileEarmarkTextFill,
  CalendarEventFill,
  BarChartFill,
  GearFill,
  TreeFill,
} from "react-bootstrap-icons";
import "./Sidebar.css";

function Sidebar({ handleLogout }) {
  const { role, username, id } = useParams();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar when link is clicked (mobile)
  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Toggle button for small screens */}
      <button
        className="btn btn-primary d-md-none position-fixed m-2"
        style={{ zIndex: 1100 ,backgroundColor: '#3A5FBE', borderColor: '#fcfcfcff'}}
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      <div className={`sidebar text-white ${isOpen ? "open" : ""}`}>
        <ul className="nav flex-column text-center mt-4">
          {/* Dashboard */}
          <li className="nav-item ">
            <NavLink
              to={`/dashboard/${role}/${username}/${id}`}
              className="nav-link text-white d-flex flex-column align-items-center justify-content-center"
              onClick={handleLinkClick}
              end
            >
              <HouseDoorFill size={20} />
              <h6 className="mt-1">Dashboard</h6>
            </NavLink>
          </li>

          {/* hr Dashboard */}
          {role === "hr" && (
            <li className="nav-item ">
              <NavLink
                to={`/dashboard/${role}/${username}/${id}/hr-core-dashboard`}
                className="nav-link text-white d-flex flex-column align-items-center"
                onClick={handleLinkClick}
                end
              >
                <HouseDoorFill size={20} />
                <h6 className="mt-1">HR Core Dashboard</h6>
              </NavLink>
            </li>
          )}
          {/* hr Dashboard */}
          {/* {role === "hr" && (
            <li className="nav-item ">
              <NavLink
                to={`/dashboard/${role}/${username}/${id}/hr-Recruitment`}
                className="nav-link text-white d-flex flex-column align-items-center"
              >
                <HouseDoorFill size={20} />
                <h6 className="mt-1">Recruitment</h6>
              </NavLink>
            </li>
          )} */}
          {/* {role === "hr" && (
            <li className="nav-item ">
              <NavLink
                to={`/dashboard/${role}/${username}/${id}/hr-Performance`}
                className="nav-link text-white d-flex flex-column align-items-center"
              >
                <HouseDoorFill size={20} />
                <h6 className="mt-1">Performance</h6>
              </NavLink>
            </li>
          )} */}

          {/* manager role */}
          {/* hr Dashboard */}
          {role === "manager" && (
            <li className="nav-item">
              <NavLink
                to={`/dashboard/${role}/${username}/${id}/manager-core-dashboard`}
                className="nav-link text-white d-flex flex-column align-items-center"
                onClick={handleLinkClick}
                end
              >
                <HouseDoorFill size={20} />
                <h6 className="mt-1">Manager Core Dashboard</h6>
              </NavLink>
            </li>
          )}
          {/* {role === "manager" && (
            <li className="nav-item ">
              <NavLink
                to={`/dashboard/${role}/${username}/${id}/my-training`}
                className="nav-link text-white d-flex flex-column align-items-center"
              >
                <HouseDoorFill size={20} />
                <h6 className="mt-1">My Training</h6>
              </NavLink>
            </li>
          )} */}

          {/* Leaves */}
          <li className="nav-item ">
            <NavLink
              to={`/dashboard/${role}/${username}/${id}/leavebalance`}
              className="nav-link text-white d-flex flex-column align-items-center"
              onClick={handleLinkClick}
              end
            >
              <TreeFill size={20} />
              {/* geetanjali code */}
             <h6 className="mt-1">
                {role === "admin" || role === "ceo" ? "Employee Leaves" : "Leaves"}
              </h6>
            </NavLink>
          </li>

          {/* Employee Registration - only for admin */}
          {role === "admin" && (
            <li className="nav-item ">
              <NavLink
                to={`/dashboard/${role}/${username}/${id}/allemployeedetails`}
                className="nav-link text-white d-flex flex-column align-items-center"
                onClick={handleLinkClick}
                end
              >
                <PersonLinesFill size={20} />
                <h6 className="mt-1">Employee Registration</h6>
              </NavLink>
            </li>
          )}

          {/* My Attendance */}
          <li className="nav-item ">
            <NavLink
              to={`/dashboard/${role}/${username}/${id}/employee`}
              className="nav-link text-white d-flex flex-column align-items-center"
              onClick={handleLinkClick}
              end
            >
              <CalendarCheckFill size={20} />
              {/* <h6 className="mt-1">My Attendance</h6> */}
              <h6 className="mt-1">
                {role === "admin" || role === "ceo" ? "Employee Attendance" : "My Attendance"}

              </h6>

            </NavLink>
          </li>

          {/* Regularization */}
          <li className="nav-item ">
            <NavLink
              to={`/dashboard/${role}/${username}/${id}/regularization`}
              className="nav-link text-white d-flex flex-column align-items-center"
              onClick={handleLinkClick}
              end
            >
              <CalendarCheckFill size={20} />
              {/* geetanjali code */}
              <h6 className="mt-1">
                {role === "admin" || role === "ceo"
                  ? "Employee Regularization"
                  : "Regularization"}
              </h6>
            </NavLink>
          </li>

          {/* Events */}
          <li className="nav-item ">
            <NavLink
              to={`/dashboard/${role}/${username}/${id}/AllEventsandHolidays`}
              className="nav-link text-white d-flex flex-column align-items-center"
              onClick={handleLinkClick}
              end
            >
              <FileEarmarkTextFill size={20} />
              {/* <h6 className="mt-1"> {role === "admin" ? "Add Events" : "Events"}</h6> */}
              {/* <h6 className="mt-1"> {role === "admin" ? "Events/Holidays" : "Events"}</h6> */}
           <h6 className="mt-1">Events & Holidays</h6>
            </NavLink>
          </li>

          {/* Holidays */}
          {/* <li className="nav-item ">
            <NavLink
              to={`/dashboard/${role}/${username}/${id}/AllHolidays`}
              className="nav-link text-white d-flex flex-column align-items-center"
            >
              <BarChartFill size={20} />
              <h6 className="mt-1">Holidays</h6>
            </NavLink>
          </li> */}

          {/* Reports */}
          {/* <li className="nav-item ">
            <NavLink
              to={`/dashboard/${role}/${username}/${id}/reports`}
              className="nav-link text-whi              te d-flex flex-column align-items-center"
            >
              <FileEarmarkTextFill size={20} />
              <h6 className="mt-1">Reports</h6>
            </NavLink>
          </li> */}

          {/* Settings */}
          <li className="nav-item ">
            <NavLink
to={`/dashboard/${role}/${username}/${id}/settings`}
              className="nav-link text-white d-flex flex-column align-items-center"
              onClick={handleLinkClick}
              end
            >
              <GearFill size={20} />
              <h6 className="mt-1">Settings</h6>
            </NavLink>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Sidebar;

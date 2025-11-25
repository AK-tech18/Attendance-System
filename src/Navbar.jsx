// src/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  function handleLogout() {
    logout();
    nav("/login");
  }

  if (!user) return null;

  return (
    <header className="navbar">
      {/* LEFT - App Name */}
      <div className="nav-left">Attendance System</div>

      {/* MIDDLE - Links */}
      {user.role === "admin" && (
        <nav className="nav-links">
          <Link to="/students">Students</Link>
          <Link to="/faculties">Faculties</Link>
          <Link to="/subjects">Subjects</Link>
          <Link to="/reports">Reports</Link>
        </nav>
      )}

      {user.role === "faculty" && (
        <nav className="nav-links">
          <Link to="/faculty">Mark Attendance</Link>
        </nav>
      )}

      {/* RIGHT - User + Logout */}
      <div className="nav-right">
        <span className="nav-user">
          {user.email} ({user.role})
        </span>
        <button className="logout-btn" onClick={handleLogout}>
          <span className="logout-label">Logout</span>
          <span className="logout-dot" />
        </button>
      </div>
    </header>
  );
}
  
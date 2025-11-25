// src/App.jsx
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./Login.jsx";
import StudentMaintenance from "./StudentMaintenance.jsx";
import AttendanceFacultyPage from "./AttendanceFacultyPage.jsx";
import FacultiesPage from "./FacultiesPage.jsx";
import SubjectsPage from "./SubjectsPage.jsx";
import AttendanceReports from "./AttendanceReports.jsx";
import ChangePassword from "./ChangePassword.jsx";
import Navbar from "./Navbar.jsx";
import { AuthProvider, useAuth } from "./AuthContext.jsx";

// ---------- Auth guard ----------
function RequireAuth({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ---------- All routes ----------
function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="app-shell fancy-bg">
      {/* Top navbar */}
      {user && <Navbar />}

      {/* Page container */}
      <main className="app-main">
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Admin-only pages */}
          <Route
            path="/students"
            element={
              <RequireAuth allowedRoles={["admin"]}>
                <StudentMaintenance />
              </RequireAuth>
            }
          />
          <Route
            path="/faculties"
            element={
              <RequireAuth allowedRoles={["admin"]}>
                <FacultiesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/subjects"
            element={
              <RequireAuth allowedRoles={["admin"]}>
                <SubjectsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/reports"
            element={
              <RequireAuth allowedRoles={["admin"]}>
                <AttendanceReports />
              </RequireAuth>
            }
          />

          {/* Change password → both admin & faculty */}
          <Route
            path="/change-password"
            element={
              <RequireAuth allowedRoles={["admin", "faculty"]}>
                <ChangePassword />
              </RequireAuth>
            }
          />

          {/* Faculty-only page */}
          <Route
            path="/faculty"
            element={
              <RequireAuth allowedRoles={["faculty"]}>
                <AttendanceFacultyPage />
              </RequireAuth>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// ---------- Root ----------
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

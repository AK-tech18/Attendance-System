// src/ChangePassword.jsx
import React, { useState } from "react";
import { api } from "./api";
import { useAuth } from "./AuthContext.jsx";

export default function ChangePassword() {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Please fill all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New password & confirm password do not match.");
      return;
    }

    try {
      setLoading(true);
      await api("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      alert("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      alert("Failed to change password: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h2 className="page-title">Change Password</h2>
      <p className="page-subtitle">
        Logged in as <strong>{user?.email}</strong>
      </p>

      <div className="card" style={{ maxWidth: 420 }}>
        <form onSubmit={handleSubmit} className="stack gap-md">
          <div className="field">
            <label className="field-label">Current password</label>
            <input
              type="password"
              className="input"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>

          <div className="field">
            <label className="field-label">New password</label>
            <input
              type="password"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Choose a new password"
            />
          </div>

          <div className="field">
            <label className="field-label">Confirm new password</label>
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
            />
          </div>

          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

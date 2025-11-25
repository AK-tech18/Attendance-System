// src/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { login as loginApi } from "./services/auth.js";
import "./Login.css";

export default function Login() {
  const nav = useNavigate();
  const auth = useAuth();

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginApi(email, password); // { token, user } or plain
      const data = res.data || res;

      auth.login(data.token, data.user);

      // ✅ Correct redirect based on role
      if (data.user.role === "admin") {
        nav("/students");
      } else if (data.user.role === "faculty") {
        nav("/faculty/attendance");
      } else {
        nav("/");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-root">
      <div className="login-glow" />
      <div className="login-card">
        <div className="login-header">
          <div className="login-badge">Attendance System</div>
          <h1>Welcome back</h1>
          <p>
            Sign in as <strong>Admin</strong> or <strong>Faculty</strong> to
            continue.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label">
            Email
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="login-label">
            Password
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <div className="login-hint">
            <span>Demo accounts:</span>
            <code>admin@example.com / admin123</code>
            <code>faculty1@example.com / faculty123</code>
          </div>
        </form>
      </div>
    </div>
  );
}

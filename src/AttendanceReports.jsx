// src/AttendanceReports.jsx
import React, { useEffect, useState } from "react";
import { api } from "./api";

export default function AttendanceReports() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api("/reports/attendance-summary");
        setRows(res.data || res);
      } catch (e) {
        alert("Failed to load reports: " + e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <h2 className="page-title">Attendance Reports</h2>
        <p className="page-subtitle">
          View per-student, per-subject attendance percentage and summary.
        </p>
        <div className="card">
          <p style={{ fontSize: 13, color: "#9fa4c2" }}>Loading reports…</p>
        </div>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="page">
        <h2 className="page-title">Attendance Reports</h2>
        <p className="page-subtitle">
          View per-student, per-subject attendance percentage and summary.
        </p>
        <div className="card">
          <p style={{ fontSize: 13, color: "#9fa4c2" }}>
            No attendance data yet. Please mark attendance from the faculty
            panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h2 className="page-title">Attendance Reports</h2>
      <p className="page-subtitle">
        Per-student, per-subject attendance summary with total classes,
        presents, and percentage.
      </p>

      <div className="card">
        <h3 style={{ marginBottom: 12, fontSize: 16 }}>Summary</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Roll</th>
                <th>Student</th>
                <th>Subject</th>
                <th>Present</th>
                <th>Total</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.roll_no}</td>
                  <td>{r.student_name}</td>
                  <td>
                    {r.code} - {r.subject_name}
                  </td>
                  <td>{r.present_count}</td>
                  <td>{r.total_classes}</td>
                  <td>{r.percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { api } from "./api";

export default function ReportsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadReports() {
    setLoading(true);
    try {
      const res = await api("/reports/attendance-summary");
      setRows(res.data || res);
    } catch (e) {
      alert("Failed to load reports: " + e.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Attendance Reports</h2>
      {loading ? (
        <p>Loading…</p>
      ) : rows.length === 0 ? (
        <p>No attendance data yet.</p>
      ) : (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Roll</th>
              <th>Student</th>
              <th>Subject</th>
              <th>Total Classes</th>
              <th>Present</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.roll_no}</td>
                <td>{r.student_name}</td>
                <td>
                  {r.subject_code} - {r.subject_name}
                </td>
                <td>{r.total_classes}</td>
                <td>{r.present_count}</td>
                <td>{r.attendance_percent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

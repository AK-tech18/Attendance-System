// src/TakeAttendance.jsx
import React, { useEffect, useState } from "react";
import { api } from "./api";

export default function TakeAttendance() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStudents();
    loadSubjects();
  }, []);

  async function loadStudents() {
    try {
      setLoading(true);
      const res = await api("/students");
      console.log("students api response:", res);
      setStudents(res.data || res); // works if res is [] or {data:[]}
    } catch (err) {
      console.error("Failed to load students:", err);
      alert("Failed to load students: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadSubjects() {
    try {
      const res = await api("/subjects");
      console.log("subjects api response:", res);
      setSubjects(res.data || res);
    } catch (err) {
      console.error("Failed to load subjects:", err);
      alert("Failed to load subjects: " + err.message);
    }
  }

  async function mark(student_id, status) {
    if (!date) {
      alert("Please select a date first.");
      return;
    }
    if (!subjectId) {
      alert("Please select a subject first.");
      return;
    }

    try {
      await api("/attendance/mark", {
        method: "POST",
        body: JSON.stringify({
          student_id,
          subject_id: subjectId,
          date,
          status,
        }),
      });
      alert("Marked successfully");
    } catch (e) {
      alert("Failed: " + e.message);
    }
  }

  async function markAll(status) {
    if (!date) {
      alert("Please select a date first.");
      return;
    }
    if (!subjectId) {
      alert("Please select a subject first.");
      return;
    }

    const ids = students.map((s) => s.id);
    if (ids.length === 0) {
      alert("No students to mark.");
      return;
    }

    try {
      await api("/attendance/bulk-mark", {
        method: "POST",
        body: JSON.stringify({
          student_ids: ids,
          subject_id: subjectId,
          date,
          status,
        }),
      });
      alert("Bulk updated!");
    } catch (e) {
      alert("Bulk error: " + e.message);
    }
  }

  // enable buttons only when everything is selected
  const canMark = Boolean(date && subjectId && students.length);

  return (
    <div className="page">
      {/* Page heading */}
      <h2 className="page-title">Take Attendance</h2>
      <p className="page-subtitle">
        Select a date and subject, then mark students as present or absent.
      </p>

      {/* ====== SESSION DETAILS CARD ====== */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12, fontSize: 16 }}>Session Details</h3>

        <div className="flex-wrap">
          {/* Date */}
          <label style={{ fontSize: 14, color: "#e5e7eb" }}>
            <div style={{ marginBottom: 4 }}>Date</div>
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>

          {/* Subject */}
          <label style={{ fontSize: 14, color: "#e5e7eb" }}>
            <div style={{ marginBottom: 4 }}>Subject</div>
            <select
              className="select"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
            >
              <option value="">Select</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p
          style={{
            marginTop: 10,
            fontSize: 12,
            color: "#9ca3af",
          }}
        >
          Choose a <strong>date</strong> and <strong>subject</strong> to enable
          the Present / Absent buttons.
        </p>
      </div>

      {/* ====== STUDENTS CARD ====== */}
      <div className="card">
        <div
          style={{
            marginBottom: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <h3 style={{ fontSize: 16, margin: 0 }}>Students</h3>
          <span style={{ fontSize: 12, color: "#9fa4c2" }}>
            {loading
              ? "Loading students…"
              : `${students.length} student(s)`}{" "}
          </span>
        </div>

        {students.length === 0 ? (
          <p style={{ fontSize: 13, color: "#9fa4c2" }}>
            No students loaded yet.
          </p>
        ) : (
          <>
            {/* Table style just like Students page */}
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 80 }}>Roll</th>
                    <th>Student</th>
                    <th style={{ width: 220 }}>Mark</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id}>
                      <td>{s.roll_no}</td>
                      <td>{s.name}</td>
                      <td>
                        <button
                          className="present-btn"
                          onClick={() => mark(s.id, "present")}
                          disabled={!canMark}
                          style={{ marginRight: 8 }}
                        >
                          Present
                        </button>

                        <button
                          className="absent-btn"
                          onClick={() => mark(s.id, "absent")}
                          disabled={!canMark}
                        >
                          Absent
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bulk buttons row */}
            <div
              style={{
                marginTop: 16,
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                className="bulk-btn"
                onClick={() => markAll("present")}
                disabled={!canMark}
              >
                Mark All Present
              </button>
              <button
                className="bulk-btn"
                onClick={() => markAll("absent")}
                disabled={!canMark}
              >
                Mark All Absent
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

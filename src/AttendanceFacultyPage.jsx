import React, { useEffect, useState } from "react";
import { api } from "./api";

export default function TakeAttendance() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    loadStudents();
    loadSubjects();
  }, []);

  async function loadStudents() {
    const res = await api("/students");
    console.log("students api response:", res);
    setStudents(res.data || res); // works if res is [] or {data:[]}
  }

  async function loadSubjects() {
    const res = await api("/subjects");
    console.log("subjects api response:", res);
    setSubjects(res.data || res);
  }

  async function mark(student_id, status) {
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
    const ids = students.map((s) => s.id);
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

  return (
    <div style={{ padding: 20 }}>
      <h2>Take Attendance</h2>

      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 12 }}>
          Date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ marginLeft: 8 }}
          />
        </label>

        <label>
          Subject:
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            <option value="">Select</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </label>
      </div>

      <h3>Students</h3>
      {students.length === 0 && <p>No students loaded.</p>}
      {students.map((s) => (
        <div key={s.id} style={{ marginBottom: 10 }}>
          {s.roll_no} - {s.name}{" "}
          <button onClick={() => mark(s.id, "present")}>Present</button>
          <button onClick={() => mark(s.id, "absent")}>Absent</button>
        </div>
      ))}

      <div style={{ marginTop: 16 }}>
        <button onClick={() => markAll("present")} style={{ marginRight: 8 }}>
          Mark All Present
        </button>
        <button onClick={() => markAll("absent")}>Mark All Absent</button>
      </div>
    </div>
  );
}

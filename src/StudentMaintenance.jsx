// src/StudentMaintenance.jsx
import React, { useEffect, useState } from "react";
import { api } from "./api";

export default function StudentMaintenance() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);

  const [newStudent, setNewStudent] = useState({
    roll_no: "",
    name: "",
    email: "",
    year: "",
    dept_id: "",
    section_id: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);

  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterSection, setFilterSection] = useState("");

  // ---------- LOADERS ----------
  async function loadStudents() {
    setLoading(true);
    try {
      const res = await api("/students");
      setStudents(res.data || res);
    } catch (e) {
      alert("Failed to load students: " + e.message);
    }
    setLoading(false);
  }

  async function loadMeta() {
    try {
      const [deptRes, secRes] = await Promise.all([
        api("/departments"),
        api("/sections"),
      ]);
      setDepartments(deptRes.data || deptRes);
      setSections(secRes.data || secRes);
    } catch (e) {
      alert("Failed to load departments/sections: " + e.message);
    }
  }

  useEffect(() => {
    loadStudents();
    loadMeta();
  }, []);

  // ---------- CRUD ----------
  async function addStudent() {
    try {
      await api("/students", {
        method: "POST",
        body: JSON.stringify(newStudent),
      });
      await loadStudents();
      setNewStudent({
        roll_no: "",
        name: "",
        email: "",
        year: "",
        dept_id: "",
        section_id: "",
      });
    } catch (e) {
      alert("Error adding student: " + e.message);
    }
  }

  async function deleteStudent(id) {
    if (!window.confirm("Delete this student?")) return;
    try {
      await api(`/students/${id}`, { method: "DELETE" });
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      alert("Delete failed: " + e.message);
    }
  }

  function startEdit(s) {
    setEditingId(s.id);
    setEditingStudent({
      roll_no: s.roll_no,
      name: s.name,
      email: s.email || "",
      year: s.year || "",
      dept_id: s.dept_id || "",
      section_id: s.section_id || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingStudent(null);
  }

  async function saveEdit(id) {
    try {
      await api(`/students/${id}`, {
        method: "PUT",
        body: JSON.stringify(editingStudent),
      });
      await loadStudents();
      cancelEdit();
    } catch (e) {
      alert("Update failed: " + e.message);
    }
  }

  // ---------- FILTERED ----------
  const filteredStudents = students.filter((s) => {
    const text = (s.roll_no + " " + s.name + " " + (s.email || "")).toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesDept =
      !filterDept || String(s.dept_id || "") === String(filterDept);
    const matchesSection =
      !filterSection || String(s.section_id || "") === String(filterSection);
    return matchesSearch && matchesDept && matchesSection;
  });

  const total = students.length;
  const filteredCount = filteredStudents.length;

  // ---------- UI ----------
  return (
    <div
      className="page fancy-bg"
      style={{
        minHeight: "100vh",
        padding: "24px 32px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 1150,
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <header
          style={{
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h2
              className="page-title"
              style={{
                fontSize: 26,
                margin: 0,
                color: "#f9fafb",
              }}
            >
              Student Management
            </h2>
            <p
              className="page-subtitle"
              style={{
                marginTop: 6,
                marginBottom: 0,
                fontSize: 14,
                color: "#9ca3af",
              }}
            >
              Add new students and manage existing records by department and
              section.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div
              className="card"
              style={{
                padding: "8px 14px",
                minWidth: 130,
                textAlign: "right",
                background:
                  "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(56,189,248,0.05))",
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 0.06,
                  color: "#cbd5f5",
                }}
              >
                Total Students
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#e5e7eb" }}>
                {total}
              </div>
            </div>

            <div
              className="card"
              style={{
                padding: "8px 14px",
                minWidth: 130,
                textAlign: "right",
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 0.06,
                  color: "#9ca3af",
                }}
              >
                Showing
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#e5e7eb" }}>
                {filteredCount}
              </div>
            </div>
          </div>
        </header>

        {/* ADD STUDENT CARD */}
        <div
          className="card"
          style={{
            marginBottom: 24,
            backgroundColor: "rgba(15,23,42,0.92)",
            borderRadius: 18,
            padding: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              marginBottom: 14,
              flexWrap: "wrap",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 600,
                color: "#e5e7eb",
              }}
            >
              Add Student
            </h3>
            <span
              style={{
                fontSize: 12,
                color: "#9ca3af",
              }}
            >
              Fill details & click <strong>Add Student</strong>
            </span>
          </div>

          <div
            className="flex-wrap"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
            }}
          >
            <input
              className="input"
              placeholder="Roll no"
              value={newStudent.roll_no}
              onChange={(e) =>
                setNewStudent({ ...newStudent, roll_no: e.target.value })
              }
              style={{ minWidth: 140 }}
            />
            <input
              className="input"
              placeholder="Name"
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, name: e.target.value })
              }
              style={{ minWidth: 180 }}
            />
            <input
              className="input"
              placeholder="Email"
              value={newStudent.email}
              onChange={(e) =>
                setNewStudent({ ...newStudent, email: e.target.value })
              }
              style={{ minWidth: 200 }}
            />
            <input
              className="input"
              placeholder="Year (1–4)"
              value={newStudent.year}
              onChange={(e) =>
                setNewStudent({ ...newStudent, year: e.target.value })
              }
              style={{ maxWidth: 110 }}
            />

            <select
              className="select"
              value={newStudent.dept_id}
              onChange={(e) =>
                setNewStudent({ ...newStudent, dept_id: e.target.value })
              }
              style={{ minWidth: 170 }}
            >
              <option value="">Select dept</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </select>

            <select
              className="select"
              value={newStudent.section_id}
              onChange={(e) =>
                setNewStudent({ ...newStudent, section_id: e.target.value })
              }
              style={{ minWidth: 140 }}
            >
              <option value="">Select section</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
            </select>

            <button
              className="primary-btn"
              onClick={addStudent}
              style={{
                padding: "8px 18px",
                fontSize: 14,
                borderRadius: 999,
              }}
            >
              + Add Student
            </button>
          </div>
        </div>

        {/* LIST + FILTERS CARD */}
        <div
          className="card"
          style={{
            backgroundColor: "rgba(15,23,42,0.92)",
            borderRadius: 18,
            padding: 20,
          }}
        >
          <div
            style={{
              marginBottom: 14,
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3
              style={{
                fontSize: 18,
                margin: 0,
                color: "#e5e7eb",
                fontWeight: 600,
              }}
            >
              Students
            </h3>

            <div
              className="flex-wrap"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                alignItems: "center",
              }}
            >
              <input
                className="input"
                placeholder="Search by roll, name, email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ minWidth: 230 }}
              />
              <select
                className="select"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
              >
                <option value="">All depts</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code}
                  </option>
                ))}
              </select>
              <select
                className="select"
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
              >
                <option value="">All sections</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p style={{ fontSize: 13, color: "#9fa4c2" }}>Loading students…</p>
          ) : filteredStudents.length === 0 ? (
            <p style={{ fontSize: 13, color: "#9fa4c2" }}>
              No students match the current filters.
            </p>
          ) : (
            <div className="table-wrapper" style={{ marginTop: 4 }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 14,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(30,64,175,0.9), rgba(30,64,175,0.65))",
                    }}
                  >
                    <th
                      style={{
                        textAlign: "left",
                        padding: "10px 8px",
                        color: "#e5e7eb",
                        fontWeight: 500,
                        fontSize: 13,
                      }}
                    >
                      Roll
                    </th>
                    <th style={{ textAlign: "left", padding: "10px 8px" }}>
                      Name
                    </th>
                    <th style={{ textAlign: "left", padding: "10px 8px" }}>
                      Email
                    </th>
                    <th style={{ textAlign: "left", padding: "10px 8px" }}>
                      Dept
                    </th>
                    <th style={{ textAlign: "left", padding: "10px 8px" }}>
                      Year
                    </th>
                    <th style={{ textAlign: "left", padding: "10px 8px" }}>
                      Section
                    </th>
                    <th
                      style={{
                        width: 160,
                        textAlign: "left",
                        padding: "10px 8px",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, idx) => {
                    const isEditing = editingId === s.id;
                    const deptName =
                      departments.find((d) => d.id === s.dept_id)?.code || "";
                    const sectionName =
                      sections.find((sec) => sec.id === s.section_id)?.name ||
                      "";

                    const rowBg =
                      idx % 2 === 0
                        ? "rgba(15,23,42,0.96)"
                        : "rgba(17,24,39,0.96)";

                    return (
                      <tr
                        key={s.id}
                        style={{
                          backgroundColor: rowBg,
                          borderBottom: "1px solid rgba(31,41,55,0.9)",
                        }}
                      >
                        <td style={{ padding: "8px 8px" }}>
                          {isEditing ? (
                            <input
                              className="input"
                              style={{ width: 100, fontSize: 13 }}
                              value={editingStudent.roll_no}
                              onChange={(e) =>
                                setEditingStudent({
                                  ...editingStudent,
                                  roll_no: e.target.value,
                                })
                              }
                            />
                          ) : (
                            s.roll_no
                          )}
                        </td>
                        <td style={{ padding: "8px 8px" }}>
                          {isEditing ? (
                            <input
                              className="input"
                              style={{ width: 170, fontSize: 13 }}
                              value={editingStudent.name}
                              onChange={(e) =>
                                setEditingStudent({
                                  ...editingStudent,
                                  name: e.target.value,
                                })
                              }
                            />
                          ) : (
                            s.name
                          )}
                        </td>
                        <td style={{ padding: "8px 8px" }}>
                          {isEditing ? (
                            <input
                              className="input"
                              style={{ width: 220, fontSize: 13 }}
                              value={editingStudent.email}
                              onChange={(e) =>
                                setEditingStudent({
                                  ...editingStudent,
                                  email: e.target.value,
                                })
                              }
                            />
                          ) : (
                            s.email
                          )}
                        </td>
                        <td style={{ padding: "8px 8px" }}>
                          {isEditing ? (
                            <select
                              className="select"
                              style={{ width: 120, fontSize: 13 }}
                              value={editingStudent.dept_id}
                              onChange={(e) =>
                                setEditingStudent({
                                  ...editingStudent,
                                  dept_id: e.target.value,
                                })
                              }
                            >
                              <option value="">Dept</option>
                              {departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.code}
                                </option>
                              ))}
                            </select>
                          ) : (
                            deptName
                          )}
                        </td>
                        <td style={{ padding: "8px 8px" }}>
                          {isEditing ? (
                            <input
                              className="input"
                              style={{ width: 70, fontSize: 13 }}
                              value={editingStudent.year}
                              onChange={(e) =>
                                setEditingStudent({
                                  ...editingStudent,
                                  year: e.target.value,
                                })
                              }
                            />
                          ) : (
                            s.year
                          )}
                        </td>
                        <td style={{ padding: "8px 8px" }}>
                          {isEditing ? (
                            <select
                              className="select"
                              style={{ width: 110, fontSize: 13 }}
                              value={editingStudent.section_id}
                              onChange={(e) =>
                                setEditingStudent({
                                  ...editingStudent,
                                  section_id: e.target.value,
                                })
                              }
                            >
                              <option value="">Section</option>
                              {sections.map((sec) => (
                                <option key={sec.id} value={sec.id}>
                                  {sec.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            sectionName
                          )}
                        </td>
                        <td style={{ padding: "8px 8px" }}>
                          {isEditing ? (
                            <>
                              <button
                                className="btn-sm"
                                onClick={() => saveEdit(s.id)}
                                style={{
                                  marginRight: 6,
                                  padding: "4px 8px",
                                  fontSize: 12,
                                }}
                              >
                                Save
                              </button>
                              <button
                                className="btn-sm"
                                onClick={cancelEdit}
                                style={{ padding: "4px 8px", fontSize: 12 }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn-sm"
                                onClick={() => startEdit(s)}
                                style={{
                                  marginRight: 6,
                                  padding: "4px 8px",
                                  fontSize: 12,
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="btn-sm"
                                onClick={() => deleteStudent(s.id)}
                                style={{ padding: "4px 8px", fontSize: 12 }}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

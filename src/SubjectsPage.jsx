// src/SubjectsPage.jsx
import React, { useEffect, useState } from "react";
import { api } from "./api";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newSubject, setNewSubject] = useState({
    code: "",
    name: "",
    dept_id: "",
    year: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);

  const [assignFacultyId, setAssignFacultyId] = useState("");
  const [assignSubjectId, setAssignSubjectId] = useState("");

  // ---------------- LOAD DATA ----------------
  async function loadData() {
    setLoading(true);
    try {
      const [subRes, deptRes, facRes, mapRes] = await Promise.all([
        api("/subjects"),
        api("/departments"),
        api("/faculties"),
        api("/subjects/mappings"),
      ]);

      setSubjects(subRes.data || subRes);
      setDepartments(deptRes.data || deptRes);
      setFaculties(facRes.data || facRes);
      setMappings(mapRes.data || mapRes);
    } catch (e) {
      alert("Failed to load subjects: " + e.message);
    }
    setLoading(false);
  }

  // ---------------- CRUD: SUBJECTS ----------------
  async function addSubject() {
    try {
      await api("/subjects", {
        method: "POST",
        body: JSON.stringify(newSubject),
      });
      setNewSubject({ code: "", name: "", dept_id: "", year: "" });
      await loadData();
    } catch (e) {
      alert("Error adding subject: " + e.message);
    }
  }

  function startEdit(s) {
    setEditingId(s.id);
    setEditingSubject({
      code: s.code,
      name: s.name,
      dept_id: s.dept_id || "",
      year: s.year || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingSubject(null);
  }

  async function saveEdit(id) {
    try {
      await api(`/subjects/${id}`, {
        method: "PUT",
        body: JSON.stringify(editingSubject),
      });
      await loadData();
      cancelEdit();
    } catch (e) {
      alert("Update failed: " + e.message);
    }
  }

  async function deleteSubject(id) {
    if (!window.confirm("Delete this subject?")) return;
    try {
      await api(`/subjects/${id}`, { method: "DELETE" });
      setSubjects(subjects.filter((s) => s.id !== id));
    } catch (e) {
      alert("Delete failed: " + e.message);
    }
  }

  // ---------------- ASSIGN / UNASSIGN ----------------
  async function assignSubject() {
    if (!assignFacultyId || !assignSubjectId) {
      alert("Please select both a faculty and a subject before assigning.");
      return;
    }

    try {
      await api("/subjects/assign", {
        method: "POST",
        body: JSON.stringify({
          faculty_id: assignFacultyId,
          subject_id: assignSubjectId,
        }),
      });
      setAssignFacultyId("");
      setAssignSubjectId("");
      await loadData();
    } catch (e) {
      alert("Failed to assign: " + e.message);
    }
  }

  async function unassignMapping(m) {
    try {
      await api(`/subjects/mappings/${m.id}`, {
        method: "DELETE",
      });
      setMappings(mappings.filter((x) => x.id !== m.id));
    } catch (e) {
      alert("Failed to unassign: " + e.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const assignDisabled = !assignFacultyId || !assignSubjectId;

  return (
    <div className="page fancy-bg">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* HEADER */}
        <h2 className="page-title">Subjects Management</h2>
        <p className="page-subtitle">
          Define subjects, map them to departments and assign them to faculties.
        </p>

        {/* -------- ADD SUBJECT CARD -------- */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
              gap: 12,
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16 }}>Add Subject</h3>
            <span
              style={{
                fontSize: 12,
                color: "#9ca3af",
              }}
            >
              Total subjects:{" "}
              <strong style={{ color: "#e5e7eb" }}>{subjects.length}</strong>
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
            }}
          >
            <input
              className="input"
              placeholder="Code (e.g. CSE101)"
              value={newSubject.code}
              onChange={(e) =>
                setNewSubject({ ...newSubject, code: e.target.value })
              }
            />
            <input
              className="input"
              placeholder="Name"
              value={newSubject.name}
              onChange={(e) =>
                setNewSubject({ ...newSubject, name: e.target.value })
              }
            />
            <select
              className="select"
              value={newSubject.dept_id}
              onChange={(e) =>
                setNewSubject({ ...newSubject, dept_id: e.target.value })
              }
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code || d.name}
                </option>
              ))}
            </select>
            <input
              className="input"
              placeholder="Year (1–4)"
              value={newSubject.year}
              onChange={(e) =>
                setNewSubject({ ...newSubject, year: e.target.value })
              }
              style={{ maxWidth: 100 }}
            />
            <button className="primary-btn" onClick={addSubject}>
              Add Subject
            </button>
          </div>
        </div>

        {/* -------- SUBJECTS TABLE CARD -------- */}
        <div className="card">
          <div
            style={{
              marginBottom: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <h3 style={{ fontSize: 16, margin: 0 }}>Subjects</h3>
            {loading && (
              <p style={{ fontSize: 12, color: "#9fa4c2", margin: 0 }}>
                Loading subjects…
              </p>
            )}
          </div>

          {loading ? null : subjects.length === 0 ? (
            <p style={{ fontSize: 13, color: "#9fa4c2" }}>
              No subjects added yet.
            </p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Dept</th>
                    <th>Year</th>
                    <th style={{ width: 140 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s) => (
                    <tr key={s.id}>
                      {editingId === s.id ? (
                        <>
                          <td>
                            <input
                              className="input"
                              value={editingSubject.code}
                              onChange={(e) =>
                                setEditingSubject({
                                  ...editingSubject,
                                  code: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <input
                              className="input"
                              value={editingSubject.name}
                              onChange={(e) =>
                                setEditingSubject({
                                  ...editingSubject,
                                  name: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <select
                              className="select"
                              value={editingSubject.dept_id}
                              onChange={(e) =>
                                setEditingSubject({
                                  ...editingSubject,
                                  dept_id: e.target.value,
                                })
                              }
                            >
                              <option value="">None</option>
                              {departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.code || d.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              className="input"
                              style={{ maxWidth: 80 }}
                              value={editingSubject.year}
                              onChange={(e) =>
                                setEditingSubject({
                                  ...editingSubject,
                                  year: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <button
                              className="btn-sm"
                              onClick={() => saveEdit(s.id)}
                            >
                              Save
                            </button>
                            <button
                              className="btn-sm"
                              style={{ marginLeft: 6 }}
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{s.code}</td>
                          <td>{s.name}</td>
                          <td>{s.dept_name || s.dept_id}</td>
                          <td>{s.year}</td>
                          <td>
                            <button
                              className="btn-sm"
                              onClick={() => startEdit(s)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn-sm"
                              style={{ marginLeft: 6 }}
                              onClick={() => deleteSubject(s.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* -------- ASSIGN SUBJECTS TO FACULTIES -------- */}
        <div className="card" style={{ marginTop: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16 }}>
              Assign Subjects to Faculties
            </h3>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              Active mappings:{" "}
              <strong style={{ color: "#e5e7eb" }}>{mappings.length}</strong>
            </span>
          </div>

          <div
            style={{
              marginBottom: 14,
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
            }}
          >
            <select
              className="select"
              value={assignFacultyId}
              onChange={(e) => setAssignFacultyId(e.target.value)}
            >
              <option value="">Select faculty</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.email})
                </option>
              ))}
            </select>

            <select
              className="select"
              value={assignSubjectId}
              onChange={(e) => setAssignSubjectId(e.target.value)}
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>

            <button
              className="primary-btn"
              onClick={assignSubject}
              disabled={assignDisabled}
              style={
                assignDisabled ? { opacity: 0.6, cursor: "not-allowed" } : {}
              }
            >
              Assign
            </button>
          </div>

          {mappings.length === 0 ? (
            <p style={{ fontSize: 13, color: "#9fa4c2" }}>
              No faculty–subject mappings yet.
            </p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Faculty</th>
                    <th>Subject</th>
                    <th style={{ width: 120 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map((m) => (
                    <tr key={m.id}>
                      <td>{m.faculty_name}</td>
                      <td>
                        {m.subject_code} - {m.subject_name}
                      </td>
                      <td>
                        <button
                          className="btn-sm"
                          onClick={() => unassignMapping(m)}
                        >
                          Unassign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

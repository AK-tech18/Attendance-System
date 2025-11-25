// src/FacultiesPage.jsx
import React, { useEffect, useState } from "react";
import { api } from "./api";

export default function FacultiesPage() {
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newFaculty, setNewFaculty] = useState({
    name: "",
    email: "",
    dept_id: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editingFaculty, setEditingFaculty] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const [facRes, deptRes] = await Promise.all([
        api("/faculties"),
        api("/departments"),
      ]);
      setFaculties(facRes.data || facRes);
      setDepartments(deptRes.data || deptRes);
    } catch (e) {
      alert("Failed to load faculties: " + e.message);
    }
    setLoading(false);
  }

  async function addFaculty() {
    try {
      await api("/faculties", {
        method: "POST",
        body: JSON.stringify(newFaculty),
      });
      setNewFaculty({ name: "", email: "", dept_id: "" });
      await loadData();
    } catch (e) {
      alert("Error adding faculty: " + e.message);
    }
  }

  function startEdit(f) {
    setEditingId(f.id);
    setEditingFaculty({
      name: f.name,
      email: f.email || "",
      dept_id: f.dept_id || "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingFaculty(null);
  }

  async function saveEdit(id) {
    try {
      await api(`/faculties/${id}`, {
        method: "PUT",
        body: JSON.stringify(editingFaculty),
      });
      await loadData();
      cancelEdit();
    } catch (e) {
      alert("Update failed: " + e.message);
    }
  }

  async function deleteFaculty(id) {
    if (!window.confirm("Delete this faculty?")) return;
    try {
      await api(`/faculties/${id}`, { method: "DELETE" });
      setFaculties(faculties.filter((f) => f.id !== id));
    } catch (e) {
      alert("Delete failed: " + e.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="page fancy-bg">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* HEADER */}
        <h2 className="page-title">Faculties Management</h2>
        <p className="page-subtitle">
          Add new faculty members and manage department assignments.
        </p>

        {/* -------------------- ADD FACULTY CARD -------------------- */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16 }}>Add Faculty</h3>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              Total faculties:{" "}
              <strong style={{ color: "#e5e7eb" }}>{faculties.length}</strong>
            </span>
          </div>

          <div className="flex-wrap">
            <input
              className="input"
              placeholder="Name"
              value={newFaculty.name}
              onChange={(e) =>
                setNewFaculty({ ...newFaculty, name: e.target.value })
              }
            />
            <input
              className="input"
              placeholder="Email"
              value={newFaculty.email}
              onChange={(e) =>
                setNewFaculty({ ...newFaculty, email: e.target.value })
              }
            />
            <select
              className="select"
              value={newFaculty.dept_id}
              onChange={(e) =>
                setNewFaculty({ ...newFaculty, dept_id: e.target.value })
              }
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code || d.name}
                </option>
              ))}
            </select>

            <button className="primary-btn" onClick={addFaculty}>
              Add Faculty
            </button>
          </div>
        </div>

        {/* -------------------- FACULTIES TABLE -------------------- */}
        <div className="card">
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
            <h3 style={{ margin: 0, fontSize: 16 }}>Faculty List</h3>
            {loading && (
              <span style={{ fontSize: 12, color: "#9fa4c2" }}>
                Loading faculties…
              </span>
            )}
          </div>

          {loading ? (
            <p style={{ fontSize: 13, color: "#9fa4c2" }}>Please wait…</p>
          ) : (
            <div className="table-wrapper">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th style={{ width: 120 }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {faculties.map((f) => (
                    <tr key={f.id}>
                      {editingId === f.id ? (
                        <>
                          <td>
                            <input
                              className="input"
                              value={editingFaculty.name}
                              onChange={(e) =>
                                setEditingFaculty({
                                  ...editingFaculty,
                                  name: e.target.value,
                                })
                              }
                            />
                          </td>

                          <td>
                            <input
                              className="input"
                              value={editingFaculty.email}
                              onChange={(e) =>
                                setEditingFaculty({
                                  ...editingFaculty,
                                  email: e.target.value,
                                })
                              }
                            />
                          </td>

                          <td>
                            <select
                              className="select"
                              value={editingFaculty.dept_id}
                              onChange={(e) =>
                                setEditingFaculty({
                                  ...editingFaculty,
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
                            <button
                              className="primary-btn small"
                              onClick={() => saveEdit(f.id)}
                            >
                              Save
                            </button>
                            <button
                              className="secondary-btn small"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{f.name}</td>
                          <td>{f.email}</td>
                          <td>{f.dept_name || f.dept_id}</td>
                          <td>
                            <button
                              className="primary-btn small"
                              onClick={() => startEdit(f)}
                            >
                              Edit
                            </button>
                            <button
                              className="danger-btn small"
                              onClick={() => deleteFaculty(f.id)}
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
      </div>
    </div>
  );
}

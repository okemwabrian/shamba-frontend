import React, { useEffect, useState } from "react";
import API from "../services/api";
import { FaLeaf, FaUser, FaSignOutAlt, FaEye, FaBars } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const Dashboard = () => {
  const [fields, setFields] = useState([]);
  const [summary, setSummary] = useState({});
  const [selectedField, setSelectedField] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    stage: "",
    notes: "",
  });

  // ✅ Get user info
  const userRole = localStorage.getItem("role") || "Agent";
  const username = localStorage.getItem("username") || "";

  const chartData = [
    { name: "Active", value: summary.active || 0 },
    { name: "At Risk", value: summary.at_risk || 0 },
    { name: "Completed", value: summary.completed || 0 },
  ];

  const COLORS = ["#43a047", "#f9a825", "#2e7d32"];

  const fetchData = async () => {
    try {
      const fieldsRes = await API.get("fields/");
      const summaryRes = await API.get("dashboard/summary/");

      setFields(fieldsRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.reload(); // redirect to login
    } else {
      fetchData();
    }
  }, []);

  const openModal = (field) => {
    setSelectedField(field);
    setForm({ stage: field.current_stage, notes: "" });
  };

  const closeModal = () => {
    setSelectedField(null);
  };

  const handleSubmit = async () => {
    try {
      await API.post("updates/", {
        field: selectedField.id,
        stage: form.stage,
        notes: form.notes,
      });

      closeModal();
      fetchData();
    } catch (err) {
      alert("Failed to update field");
    }
  };

  const getStatusClass = (status) => {
    if (status === "Active") return "badge active";
    if (status === "At Risk") return "badge risk";
    if (status === "Completed") return "badge completed";
    return "badge";
  };

  return (
    <div className="app-container">

      {/* Sidebar */}
      <div className={`sidebar ${menuOpen ? "active" : ""}`}>
        <div>
          <h2 className="logo">
            <FaLeaf /> SmartSeason
          </h2>

          {/* ✅ UPDATED USER DISPLAY */}
          <p>
            <FaUser /> User: {userRole} {username && `(${username})`}
          </p>
        </div>

        <button
          className="logout-btn"
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* Main */}
      <div className="main-content">

        {/* Top bar */}
        <div className="top-bar">
          <button
            className="menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <FaBars />
          </button>

          <h2><MdDashboard /> Dashboard</h2>
        </div>

        {/* Loading */}
        {loading ? (
          <p>Loading dashboard...</p>
        ) : (
          <>
            {/* Cards */}
            <div className="cards">
              <div className="card">
                <h3>Total</h3>
                <p>{summary.total || 0}</p>
              </div>
              <div className="card">
                <h3>Active</h3>
                <p>{summary.active || 0}</p>
              </div>
              <div className="card">
                <h3>At Risk</h3>
                <p>{summary.at_risk || 0}</p>
              </div>
              <div className="card">
                <h3>Completed</h3>
                <p>{summary.completed || 0}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="charts">
              <div className="chart-box">
                <h3>Field Status Overview</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-box">
                <h3>Status Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={chartData} dataKey="value" outerRadius={80}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Table */}
            <div className="table-container">
              {fields.length === 0 ? (
                <p style={{ textAlign: "center", padding: "20px" }}>
                  No fields assigned yet 🌱
                </p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Crop</th>
                      <th>Stage</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {fields.map((field) => (
                      <tr key={field.id}>
                        <td>{field.name}</td>
                        <td>{field.crop_type}</td>
                        <td>{field.current_stage}</td>
                        <td>
                          <span className={getStatusClass(field.status)}>
                            {field.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="action-btn"
                            onClick={() => openModal(field)}
                          >
                            <FaEye /> Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {selectedField && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Update Field</h3>

            <label>Stage</label>
            <select
              value={form.stage}
              onChange={(e) =>
                setForm({ ...form, stage: e.target.value })
              }
            >
              <option value="PLANTED">Planted</option>
              <option value="GROWING">Growing</option>
              <option value="READY">Ready</option>
              <option value="HARVESTED">Harvested</option>
            </select>

            <label>Notes</label>
            <textarea
              onChange={(e) =>
                setForm({ ...form, notes: e.target.value })
              }
            />

            <div className="modal-actions">
              <button onClick={closeModal}>Cancel</button>
              <button className="save-btn" onClick={handleSubmit}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
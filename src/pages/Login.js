import React, { useState } from "react";
import API from "../services/api"; // ✅ FIXED (removed setAuthToken)

// Icons
import { FaLeaf, FaUser, FaLock } from "react-icons/fa";

const Login = ({ setIsAuthenticated }) => {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    setLoading(true);

    try {
      const res = await API.post("token/", form);

      // ✅ Store token
      localStorage.setItem("token", res.data.access);

      // ✅ Store user info
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("username", res.data.username);

      // ❌ REMOVED setAuthToken (handled automatically)

      // ✅ Authenticate user
      setIsAuthenticated(true);
    } catch (err) {
      alert("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">
          <FaLeaf className="icon" /> SmartSeason
        </h2>

        <p className="login-subtitle">Field Monitoring System</p>

        {/* Username */}
        <div className="input-group">
          <FaUser className="input-icon" />
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
          />
        </div>

        {/* Password */}
        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
          />
        </div>

        {/* Button */}
        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
};

export default Login;
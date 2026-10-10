import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // ✅ clear token
    navigate("/login");
  };

  return (
    <nav style={{ padding: "10px", background: "#eee" }}>
      <Link to="/register" style={{ marginRight: "10px" }}>Register</Link>
      <Link to="/login" style={{ marginRight: "10px" }}>Login</Link>
      <Link to="/tasks" style={{ marginRight: "10px" }}>Tasks</Link>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}


import React from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <h1 className="title">Work To Do</h1>
      <button className="start-btn" onClick={() => navigate("/login")}>
        Let's Do It
      </button>
    </div>
  );
}

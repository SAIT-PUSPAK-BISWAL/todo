import React, { useState } from "react";
import API from "../services/api";

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const { data } = await API.post("/tasks", { title });
    onAdd(data);
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add task here"
        style={{ padding: "8px", width: "250px", marginRight: "10px" }}
      />
      <button type="submit">Save</button>
    </form>
  );
}

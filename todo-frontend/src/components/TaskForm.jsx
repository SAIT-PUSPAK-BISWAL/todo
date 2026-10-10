
import React, { useState } from "react";
import API from "../services/api";

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { data } = await API.post("/tasks", {
        title: title.trim()
      });

      onAdd(data);
      setTitle("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create task. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <input
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setError("");
        }}
        placeholder="Add task here"
        maxLength={200}
        disabled={loading}
        style={{ padding: "8px", width: "250px", marginRight: "10px" }}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </button>

      {error && (
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
      )}
    </form>
  );
}

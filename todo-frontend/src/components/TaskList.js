import React, { useState } from "react";
import API from "../services/api";

export default function TaskList({ tasks, setTasks, font, bullet }) {
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  const toggleTask = async (task) => {
    try {
      const { data } = await API.put(`/tasks/${task._id}`, {
        completed: !task.completed,
      });
      setTasks(tasks.map((t) => (t._id === task._id ? data : t)));
    } catch (err) {
      console.error("Toggle failed:", err.response?.data || err.message);
    }
  };

  const deleteTask = async (id) => {
    // trigger fade‑out
    setDeletingTaskId(id);

    // wait for animation to finish before actually deleting
    setTimeout(async () => {
      try {
        await API.delete(`/tasks/${id}`);
        setTasks(tasks.filter((t) => t._id !== id));
        setDeletingTaskId(null);
      } catch (err) {
        console.error("Delete failed:", err.response?.data || err.message);
      }
    }, 500); // 👈 matches CSS transition duration
  };

  return (
    <div>
      {tasks.map((task) => (
        <div
          key={task._id}
          style={{
            marginBottom: "10px",
            border: "1px solid #ccc",
            padding: "10px",
            fontFamily: font,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: task.completed ? "#e6ffe6" : "#fff8b3",
            borderRadius: "6px",
            boxShadow: "2px 4px 6px rgba(0,0,0,0.2)",
            transition: "opacity 0.5s ease", // 👈 fade effect
            opacity: deletingTaskId === task._id ? 0 : 1, // 👈 fade out when deleting
          }}
        >
          <p
            style={{
              margin: 0,
              textDecoration: task.completed ? "line-through" : "none",
              color: task.completed ? "#555" : "#000",
              fontWeight: task.completed ? "normal" : "bold",
            }}
          >
            {bullet} {task.title}
          </p>

          <div>
            <button
              onClick={() => toggleTask(task)}
              style={{
                marginRight: "10px",
                background: task.completed ? "#4CAF50" : "#f44336",
                color: "white",
                border: "none",
                padding: "6px 10px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {task.completed ? "✅ Done" : "❌ Not Done"}
            </button>

            <button
              onClick={() => deleteTask(task._id)}
              style={{
                background: "#ff6666",
                color: "white",
                border: "none",
                padding: "6px 10px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}


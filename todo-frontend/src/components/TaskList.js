
import React, { useState } from "react";
import API from "../services/api";

export default function TaskList({ tasks, setTasks, font, bullet }) {
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [updatingTaskIds, setUpdatingTaskIds] = useState([]);

  const toggleTask = async (task) => {
    if (updatingTaskIds.includes(task._id) || deletingTaskId === task._id) {
      return;
    }

    setUpdatingTaskIds((ids) => [...ids, task._id]);

    try {
      const { data } = await API.put(`/tasks/${task._id}`, {
        completed: !task.completed,
      });

      setTasks((currentTasks) =>
        currentTasks.map((t) => (t._id === task._id ? data : t))
      );
    } catch (err) {
      console.error("Toggle failed:", err.response?.data || err.message);
      alert("Failed to update task. Please try again.");
    } finally {
      setUpdatingTaskIds((ids) =>
        ids.filter((id) => id !== task._id)
      );
    }
  };

  const deleteTask = async (id) => {
    if (deletingTaskId !== null || updatingTaskIds.includes(id)) {
      return;
    }

    setDeletingTaskId(id);

    // Allow the fade-out animation to finish.
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      await API.delete(`/tasks/${id}`);

      setTasks((currentTasks) =>
        currentTasks.filter((t) => t._id !== id)
      );
    } catch (err) {
      console.error("Delete failed:", err.response?.data || err.message);
      alert("Failed to delete task. Please try again.");
    } finally {
      setDeletingTaskId(null);
    }
  };

  return (
    <div>
      {tasks.map((task) => {
        const isDeleting = deletingTaskId === task._id;
        const isUpdating = updatingTaskIds.includes(task._id);

        return (
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
              transition: "opacity 0.5s ease",
              opacity: isDeleting ? 0 : 1,
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
                disabled={isUpdating || isDeleting}
                style={{
                  marginRight: "10px",
                  background: task.completed ? "#4CAF50" : "#f44336",
                  color: "white",
                  border: "none",
                  padding: "6px 10px",
                  borderRadius: "4px",
                  cursor: isUpdating || isDeleting ? "not-allowed" : "pointer",
                }}
              >
                {isUpdating
                  ? "Updating..."
                  : task.completed
                    ? "✅ Done"
                    : "❌ Not Done"}
              </button>

              <button
                onClick={() => deleteTask(task._id)}
                disabled={deletingTaskId !== null || isUpdating}
                style={{
                  background: "#ff6666",
                  color: "white",
                  border: "none",
                  padding: "6px 10px",
                  borderRadius: "4px",
                  cursor:
                    deletingTaskId !== null || isUpdating
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

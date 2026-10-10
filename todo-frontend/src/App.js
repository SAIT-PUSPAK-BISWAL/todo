import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./components/Landing";
import ProfileImageUpload from "./components/ProfileImageUpload";
import API from "./services/api";
import "./App.css";

function App() {
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const [showFonts, setShowFonts] = useState(false);
  const [showBullets, setShowBullets] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [font, setFont] = useState("Arial");
  const [bullet, setBullet] = useState("•");
  const [profileImage, setProfileImage] = useState(null);

  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");

  
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      return;
    }

    API.get("/tasks")
      .then((res) => {
        setTasks(res.data);
      })
      .catch((err) => {
        console.error("Failed to load tasks:", err.message);
      });

    if (userId) {
      API.get(`/auth/${userId}`)
        .then((res) => {
          if (res.data.image) {
            setProfileImage(
              `${process.env.REACT_APP_API_URL || "http://localhost:5000"}${res.data.image}`
            );
          }
        })
        .catch((err) => {
          console.error("Failed to load profile image:", err.message);
        });
    }
   }, [userId, location.pathname]);


  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <div style={{ padding: "20px" }}>
                {/* Greeting + Avatar */}
                <h2 style={{ fontSize: "28px", display: "flex", alignItems: "center" }}>
                  hello {username}
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="profile"
                      style={{
                        width: "80px",       // bigger avatar
                        height: "80px",
                        borderRadius: "50%",
                        marginLeft: "15px",
                        objectFit: "cover",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        backgroundColor: "#ccc",
                        display: "inline-block",
                        marginLeft: "15px"
                      }}
                    />
                  )}
                </h2>

                {/* Toolbar buttons */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px", gap: "10px" }}>
                  <div>
                    <button onClick={() => setShowFonts(!showFonts)}>Fonts</button>
                    {showFonts && (
                      <ul style={{ listStyle: "none", padding: "5px", border: "1px solid #ccc", background: "#f9f9f9" }}>
                        <li onClick={() => setFont("Arial")}>Arial</li>
                        <li onClick={() => setFont("Times New Roman")}>Times New Roman</li>
                        <li onClick={() => setFont("Courier New")}>Courier New</li>
                      </ul>
                    )}
                  </div>

                  <div>
                    <button onClick={() => setShowBullets(!showBullets)}>Bullets</button>
                    {showBullets && (
                      <ul style={{ listStyle: "none", padding: "5px", border: "1px solid #ccc", background: "#f9f9f9" }}>
                        <li onClick={() => setBullet("•")}>• Dot</li>
                        <li onClick={() => setBullet("→")}>→ Arrow</li>
                        <li onClick={() => setBullet("✓")}>✓ Check</li>
                      </ul>
                    )}
                  </div>

                  <button onClick={() => setShowUpload(!showUpload)}>Upload Image</button>

                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("username");
                      localStorage.removeItem("userId");
                      window.location.href = "/login";
                    }}
                  >
                    Logout
                  </button>
                </div>

                {/* Upload UI toggled */}
                {showUpload && (
                  <ProfileImageUpload
                    userId={userId}
                    onUploadSuccess={(newUrl) => setProfileImage(newUrl)}
                  />
                )}

                <TaskForm onAdd={(newTask) => setTasks([...tasks, newTask])} />
                <TaskList tasks={tasks} setTasks={setTasks} font={font} bullet={bullet} />
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function RootApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}


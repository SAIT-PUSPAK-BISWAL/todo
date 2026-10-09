const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const uploadRoutes = require("./routes/upload"); // ✅ add this

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

// ✅ Serve uploaded files
app.use("/uploads", express.static("uploads"));

app.use("/auth", authRoutes);   // must be a router
app.use("/tasks", taskRoutes);  // must be a router
app.use("/", uploadRoutes);     // ✅ add upload routes

app.listen(5000, () => console.log("Server running on port 5000"));



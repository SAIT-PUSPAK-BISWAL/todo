const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const User = require("../models/user");

const router = express.Router();

// ✅ Ensure uploads folder exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// Upload + attach to user
router.post("/upload/:id", upload.single("image"), async (req, res) => {
  try {
    // 🔎 Debug logs
    console.log("Upload route hit");
    console.log("req.params.id:", req.params.id);
    console.log("req.file:", req.file);

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // ✅ validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log("Invalid ObjectId received:", req.params.id);
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      console.log("User not found for ID:", req.params.id);
      return res.status(404).json({ message: "User not found" });
    }

    user.image = `/uploads/${req.file.filename}`;
    await user.save();

    console.log("Image saved for user:", user._id);

    res.json({ message: "Image uploaded successfully", imageUrl: user.image });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


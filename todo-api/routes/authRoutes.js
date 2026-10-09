const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const User = require("../models/user");

// 📝 Register
router.post("/register", authController.register);

// 🔑 Login
router.post("/login", authController.login);

// 👤 Get user by ID (for profile image and details)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; // ✅ must be here


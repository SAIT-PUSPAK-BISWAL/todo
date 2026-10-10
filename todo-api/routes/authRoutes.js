
const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");

// Register
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);

// Get authenticated user's profile
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    // Users can access only their own profile
    if (req.params.id !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to view this profile"
      });
    }

    // Return only fields needed by the frontend
    const user = await User.findById(req.user.id)
      .select("_id username email image");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.json(user);
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        message: "Invalid user ID"
      });
    }

    console.error("Profile retrieval error:", err.message);

    return res.status(500).json({
      message: "Server error while retrieving profile"
    });
  }
});

module.exports = router;

const crypto = require("crypto");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Use an absolute uploads directory
const uploadDir = path.join(__dirname, "..", "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

// Accept only JPEG, PNG, and WebP images
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp"
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extensionMap = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp"
    };

    const extension = extensionMap[file.mimetype];

    if (!extension) {
      return cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
    }

    cb(null, `${crypto.randomUUID()}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
    }

    cb(null, true);
  }
});

// Upload a profile image for the authenticated user
router.post(
  "/upload/:id",
  authMiddleware,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (!err) {
        return next();
      }

      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          message: "Image must be 2 MB or smaller"
        });
      }

      return res.status(400).json({
        message: err.message || "Invalid image upload"
      });
    });
  },
  async (req, res) => {
    let uploadedPath;

    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      if (req.params.id !== req.user.id) {
        return res.status(403).json({
          message: "You cannot change another user's profile image"
        });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      uploadedPath = req.file.path;

      const user = await User.findById(req.user.id);

      if (!user) {
        fs.unlink(uploadedPath, () => {});
        return res.status(404).json({ message: "User not found" });
      }

      user.image = `/uploads/${req.file.filename}`;
      await user.save();

      return res.json({
        message: "Image uploaded successfully",
        imageUrl: user.image
      });
    } catch (err) {
      if (uploadedPath) {
        fs.unlink(uploadedPath, () => {});
      }

      console.error("Upload error:", err.message);

      return res.status(500).json({
        message: "Server error while uploading image"
      });
    }
  }
);

module.exports = router;

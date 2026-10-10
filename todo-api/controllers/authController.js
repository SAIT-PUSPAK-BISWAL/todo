
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from .env");
}

const SECRET = process.env.JWT_SECRET;

// Register
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (
      !username ||
      !email ||
      !password ||
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Valid username, email, and password are required"
      });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanUsername || !cleanEmail) {
      return res.status(400).json({
        message: "Username and email cannot be empty"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long"
      });
    }

    if (Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        message: "Password must not exceed 72 bytes"
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword
    });

    await user.save();

    return res.status(201).json({
      message: "User registered successfully"
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "User already exists"
      });
    }

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid registration details"
      });
    }

    console.error("Registration error:", err.message);

    return res.status(500).json({
      message: "Server error during registration"
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Valid email and password are required"
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { id: user._id.toString() },
      SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      token,
      userId: user._id,
      username: user.username
    });
  } catch (err) {
    console.error("Login error:", err.message);

    return res.status(500).json({
      message: "Server error during login"
    });
  }
};

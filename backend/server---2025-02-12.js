require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

const PORT = 5000;
const SECRET_KEY = "your_secret_key";
const SERVER_URL = "http://localhost:5000";

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "angular-test",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL Database");
  }
});

// Multer Setup for File Upload
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// **User Registration Route**
app.post("/register", upload.single("photo"), async (req, res) => {
  const { name, email, mobile, address, password, username } = req.body;
  const photo = req.file ? req.file.filename : null; // Store only the filename in DB

  if (!name || !email || !mobile || !address || !password || !username) {
    return res.status(400).json({ error: "Missing required fields!" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      "SELECT id FROM users WHERE email = ? OR mobile = ? OR username = ?",
      [email, mobile, username],
      (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (results.length > 0) {
          return res.status(409).json({ error: "Email, Mobile, or Username already exists!" });
        }
        const sql = `INSERT INTO users (name, email, mobile, address, password, username, photo) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.query(sql, [name, email, mobile, address, hashedPassword, username, photo], (err, result) => {
          if (err) return res.status(500).json({ error: "Database error" });
          res.json({ message: "✅ User registered successfully!", userId: result.insertId });
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// **User Login**
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Login failed" });
    if (results.length === 0) return res.status(401).json({ error: "User not found" });
    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: "Invalid credentials" });
    // ✅ Fix photo URL format
    user.photo = user.photo ? `${SERVER_URL}/uploads/${user.photo}` : null;
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ message: "✅ Login successful", token, user });
  });
});

// **Get User Profile**
app.get("/profile/:id", (req, res) => {
  const userId = req.params.id;
  const sql = "SELECT id, name, email, mobile, address, username, photo FROM users WHERE id = ?";
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "Error fetching profile" });
    if (results.length === 0) return res.status(404).json({ error: "User not found" });
    const user = results[0];
    user.photo = user.photo ? `${SERVER_URL}/uploads/${user.photo}` : null;
    res.json(user);
  });
});

// **Get All Users**
app.get("/users", (req, res) => {
  const sql = "SELECT id, name, email, mobile, password, address, username, photo FROM users";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching users:", err);
      return res.status(500).json({ error: "Error fetching users" });
    }
    // ✅ Fix photo URLs
    const users = results.map(user => ({
      ...user,
      photo: user.photo ? `${SERVER_URL}/uploads/${user.photo}` : null,
    }));
    res.json(users);
  });
});

// **Delete User (and remove their photo)**
app.delete("/users/:id", (req, res) => {
  const userId = req.params.id;
  // **Step 1: Get User Photo**
  db.query("SELECT photo FROM users WHERE id = ?", [userId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching user:", err);
      return res.status(500).json({ error: "Error fetching user" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userPhoto = results[0].photo;
    // **Step 2: Delete User from Database**
    db.query("DELETE FROM users WHERE id = ?", [userId], (err, result) => {
      if (err) {
        console.error("❌ Error deleting user:", err);
        return res.status(500).json({ error: "Error deleting user" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      // **Step 3: Delete the Image File (if exists)**
      if (userPhoto) {
        const imagePath = path.join(__dirname, "uploads", userPhoto);
        fs.unlink(imagePath, (err) => {
          if (err) console.error("⚠️ Error deleting image:", err);
        });
      }
      res.json({ message: "✅ User deleted successfully!" });
    });
  });
});
  
// **reset password**
app.post("/reset-password", async (req, res) => {
  const { userId, newPassword } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const sql = "UPDATE users SET password = ? WHERE id = ?";
    db.query(sql, [hashedPassword, userId], (err, result) => {
      if (err) {
        console.error("❌ Error updating password:", err);
        return res.status(500).json({ error: "Error updating password" });
      }
      res.json({ message: "Password updated successfully" });
    });
  } catch (error) {
    console.error("❌ Error hashing password:", error);
    res.status(500).json({ error: "Error hashing password" });
  }
});

// **Start Server**
app.listen(PORT, () => {console.log(`🚀 Server running on ${SERVER_URL}`);});

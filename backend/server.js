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

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

const PORT = 5000;
const SECRET_KEY = "your_secret_key"; // Secret key for JWT
const SERVER_URL = "http://localhost:5000"; // URL for the server

// MySQL connection setup
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "angular-test",
});

// Connected to MySQL Database log show
db.connect((err) => {if (err) {console.log("❌ Error connecting to DB:", err);} else {console.log("✅ Connected to MySQL Database");}});
// Start the server log show
app.listen(PORT, () => {console.log(`🚀 Server is running on --> http://localhost:${PORT}`);});

// Multer setup for file uploading
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Set where to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Make the file name unique
  },
});

const upload = multer({ storage: storage });


// Get All Users route
app.get("/users", (req, res) => {
  db.query("SELECT id, name, email, mobile, address, username, photo FROM users", (err, results) => {
    if (err) {return res.status(500).json({ error: "Error fetching users" });}
    const users = results.map(user => ({...user, photo: user.photo ? `${SERVER_URL}/uploads/${user.photo}` : null,}));
    res.json(users);
  });
});

// User Registration route
app.post("/register", upload.single("photo"), async (req, res) => {
  const { name, email, mobile, address, password, username } = req.body;
  const photo = req.file ? req.file.filename : null;
  // Check if all required fields are provided
  if (!name || !email || !mobile || !address || !password || !username) {
    return res.status(400).json({ error: "Missing required fields!" });
  }
  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);
    // Check if the email, mobile, or username already exists
    db.query(
      "SELECT id FROM users WHERE email = ? OR mobile = ? OR username = ?",
      [email, mobile, username],
      (err, results) => {
        if (err) return res.status(500).json({ error: "Database error!" });
        if (results.length > 0) {
          return res.status(409).json({ error: "Email, Mobile, or Username already exists!" });
        }
        // Insert the new user into the database
        const sql = `INSERT INTO users (name, email, mobile, address, password, username, photo) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.query(
          sql,
          [name, email, mobile, address, hashedPassword, username, photo],
          (err, result) => {
            if (err) return res.status(500).json({ error: "Database error!" });
            res.json({ message: "✅ User registered successfully!", userId: result.insertId });
          }
        );
      }
    );
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// User Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Login failed" });
    if (results.length === 0) return res.status(401).json({ error: "User not found" });
    const user = results[0];
    // ✅ Check if password matches
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: "Invalid credentials" });
    // ✅ Generate JWT token
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });
    // ✅ Fix: Use Backticks for Template Literal
    user.photo = user.photo ? `${SERVER_URL}/uploads/${user.photo}` : null;
    res.json({ message: "✅ Login successful", token, user });
  });
});

// Get User Profile route
app.get("/profile/:id", (req, res) => {
  const userId = req.params.id;
  // Get the user details by ID
  db.query(
    "SELECT id, name, email, mobile, address, username, photo FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Error fetching profile" });
      if (results.length === 0) return res.status(404).json({ error: "User not found" });
      const user = results[0];
      // Attach photo URL if exists
      user.photo = user.photo ? `${SERVER_URL}/uploads/${user.photo}` : null;
      res.json(user);
    }
  );
});

// Delete User route (and delete their photo if exists)
app.delete("/users/:id", (req, res) => {
  const userId = req.params.id;
  // Find the user's photo first
  db.query("SELECT photo FROM users WHERE id = ?", [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching user" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const userPhoto = results[0].photo;
    // Delete user from the database
    db.query("DELETE FROM users WHERE id = ?", [userId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Error deleting user" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      // Delete the photo from the file system if exists
      if (userPhoto) {
        const imagePath = path.join(__dirname, "uploads", userPhoto);
        fs.unlink(imagePath, (err) => {
          if (err) console.log("⚠️ Error deleting photo", err);
        });
      }
      res.json({ message: "✅ User deleted successfully!" });
    });
  });
});

// Reset Password route
app.post("/reset-password", async (req, res) => {
  const { userId, newPassword } = req.body;
  try {const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Update the password in the database
    const sql = "UPDATE users SET password = ? WHERE id = ?";
    db.query(sql, [hashedPassword, userId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Error updating password" });
      }
      res.json({ message: "✅ Password updated successfully" });
    });
  } catch (error) {
    return res.status(500).json({ error: "Error hashing the password" });
  }
});

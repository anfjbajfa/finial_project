const pool = require("../models/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ──────────────────────────────
// REGISTER
// ──────────────────────────────
exports.register = async (req, res) => {
  const {
    email,
    password,
    first_name,
    last_name,
    age,
    gender,
    university,
    ssn,
    nationality,
    home_address,
    ssn_pic,
    role,
    department,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await pool.query(
      `INSERT INTO users
        (email, password, first_name, last_name, age, gender, university, ssn, nationality, home_address, ssn_pic, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id`,
      [
        email,
        hashedPassword,
        first_name,
        last_name,
        age,
        gender,
        university,
        ssn,
        nationality,
        home_address,
        ssn_pic,
        role,
      ]
    );

    const userId = userResult.rows[0].id;

    if (role === "student") {
      await pool.query(
        "INSERT INTO students (student_id, department) VALUES ($1, $2)",
        [userId, department]
      );
    } else if (role === "admin") {
      await pool.query("INSERT INTO admins (admin_id) VALUES ($1)", [userId]);
    }

    res.status(200).json({ message: "User registered successfully", userId });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({
      error: "Registration failed, please check all needed information",
    });
  }
};

// ──────────────────────────────
// LOGIN
// ──────────────────────────────
exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    if (user.role !== role) {
      return res.status(403).json({ error: "Role not matched" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      first_name: user.first_name,
      id: user.id,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
};

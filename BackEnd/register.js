const express = require("express");
const router = express.Router();
const pool = require("./dataBase");
const bcrypt = require("bcrypt");

router.post("/add", async (req, res) => {
  const { email, password, name, grade } = req.body;

  try {
    const emailCheck = await pool.query(
      "SELECT * FROM _user WHERE email = $1",
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO _user(email, password, name, grade) VALUES($1, $2, $3, $4)",
      [email, hashedPassword, name, grade]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ success: false, message: "Error inserting data" });
  }
});

router.get("/print", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM _user");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ success: false, message: "Error fetching data" });
  }
});

module.exports = router;

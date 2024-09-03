const express = require("express");
const cookieParser = require("cookie-parser");
const pool = require("./dataBase");
const bcrypt = require("bcrypt"); 
const router = express.Router();

router.use(express.json());
router.use(cookieParser());

router.post("/add", async (req, res) => {
  const { email, password, isAdmin } = req.body;

  try {
    console.log("Setting cookies...");

    req.session.email = email;
    res.cookie("email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });

    if (isAdmin) {
      if (email === "admin@gmail.com" && password === "admin123") {
        res.cookie("userSession", "true", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Lax",
        });
        res.cookie("isAdmin", "true", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Lax",
        });
        return res.json({ success: true, isAdmin: true, loggedIn: true });
      } else {
        return res.json({
          success: false,
          message: "Invalid admin credentials",
          loggedIn: false
        });
      }
    }

    const result = await pool.query("SELECT * FROM _user WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      res.json({ success: false, message: "Email not found", loggedIn: false });
    } else {
      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        res.json({ success: false, message: "Incorrect password", loggedIn: false });
      } else {
        res.cookie("userSession", "true", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Lax",
        });
        res.cookie("isAdmin", "false", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Lax",
        });
        res.cookie("email", email, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Lax",
        });
        res.json({ success: true, isAdmin: false, loggedIn: true });
      }
    }
  } catch (err) {
    console.error("Error querying the database:", err);
    res.status(500).send("An error occurred while processing your request.");
  }
});




router.post("/logout", (req, res) => {
  res.clearCookie("userSession");
  res.clearCookie("isAdmin");
  res.clearCookie("email");
  res.json({ success: true, message: "Logged out successfully" });
});


router.get("/check-login", (req, res) => {
  console.log("Cookies received:", req.cookies);
  const isLoggedIn = req.cookies.userSession === "true";
  const isAdmin = req.cookies.isAdmin === "true";
  console.log(`Login status: ${isLoggedIn}, Admin status: ${isAdmin}`);
  res.json({ loggedIn: isLoggedIn, isAdmin });
});

router.get("/get-user-name", async (req, res) => {
  if (!req.cookies.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const email = req.cookies.email;
    const result = await pool.query("SELECT name FROM _user WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0) {
      res.json({ name: result.rows[0].name });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user name:", error);
    res.status(500).json({ message: "Error fetching user name" });
  }
});

module.exports = router;

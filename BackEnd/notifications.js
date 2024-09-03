const express = require("express");
const router = express.Router(); 
const cookieParser = require("cookie-parser");

const pool = require("./dataBase");
router.use(express.json());
router.use(cookieParser());

router.get("/getAllNotifications", async (req, res) => {
  try {
    let email = req.session.email; 
    console.log(email);

    const result = await pool.query(
      "SELECT * FROM notifications WHERE email =($1)",
      [email]
    );

    let notifications = [];

    for (let i = 0; i < result.rows.length; i++) {
      const val = await pool.query(
        "SELECT id, title, uploaddate FROM news WHERE id = ($1)",
        [result.rows[i].newsid]
      );

      if (val.rows.length > 0) {
        notifications.push({
          id: val.rows[0].id,
          title: val.rows[0].title,
          uploadDate: val.rows[0].uploaddate,
          isNew: result.rows[i].isnew, 
        });
      }
    }

    notifications.sort((a, b) => b.uploadDate.localeCompare(a.uploadDate));

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch notifications." });
  }
});

router.get("/getNewNotifications", async (req, res) => {
  try {
    let email = req.session.email; 

   const result = await pool.query(
      "SELECT * FROM notifications WHERE email = ($1) AND isNew = ($2)",
      [email, 1]
    );

    let notifications = [];

    for (let i = 0; i < result.rows.length; i++) {
      await pool.query(
        "UPDATE notifications SET isNew = ($1) WHERE newsid = ($2)",
        [0, result.rows[i].newsid]
      );

      const val = await pool.query(
        "SELECT id, title, uploadDate FROM news WHERE id = ($1)",
        [result.rows[i].newsid]
      );

      if (val.rows.length > 0) {
        notifications.push({
          id: val.rows[0].id,
          title: val.rows[0].title,
          uploadDate: val.rows[0].uploaddate,
          isNew: result.rows[i].isnew, 
        });
      }
    }

    notifications.sort((a, b) => b.uploadDate.localeCompare(a.uploadDate));

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    res.status(500).json({ success: false, message: "Failed to fetch notifications." });
  }
});


module.exports = router;

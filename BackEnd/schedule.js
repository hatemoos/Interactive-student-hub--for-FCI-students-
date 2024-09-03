const express = require("express");
const router = express.Router();
const pool = require("./dataBase");

router.post("/addSchedule", async (req, res) => {
  const { uploadDate, jsonData, year } = req.body;

  try {
    const jsonString = JSON.stringify(jsonData);
    await pool.query(
      `INSERT INTO schedule (year, uploadDate, jsonData) 
       VALUES ($1, $2, $3)
       ON CONFLICT (year) 
       DO UPDATE SET
       uploadDate = EXCLUDED.uploadDate,
       jsonData = EXCLUDED.jsonData`,
      [year, uploadDate, jsonString]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ success: false, message: "Error inserting data" });
  }
});

router.get("/getSchedule", async (req, res) => {
  const { year } = req.query;

  try {
    const result = await pool.query(
      "SELECT * FROM schedule WHERE year = $1 ORDER BY uploadDate DESC LIMIT 1",
      [year]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json({ jsondata: [] }); 
    }
  } catch (error) {
    console.error("Error fetching schedule data:", error);
    res.status(500).json({ error: "Error fetching schedule data" });
  }
});

module.exports = router;

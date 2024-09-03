const express = require("express");
const router = express.Router();
const pool = require("./dataBase");


router.post("/add", async (req, res) => {
  const professor = req.body.selectedProfessor;
  const uploadDate = req.body.uploadDate;
  const jsonData = req.body.jsonData;
  try {
  
    await pool.query(`
      INSERT INTO professorAvailability (professor, uploadDate, jsonData)
      VALUES ($1, $2, $3)
      ON CONFLICT (professor)
      DO UPDATE SET
        uploadDate = EXCLUDED.uploadDate,
        jsonData = EXCLUDED.jsonData
    `, [professor, uploadDate, jsonData]);

    res.json({ success: true });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ success: false, message: "Error inserting data" });
  }
});

router.get("/getAvailability", async (req, res) => {
  const { professor } = req.query; 

  if (!professor) {
    return res.status(400).json({ error: "Professor name is required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM professorAvailability WHERE professor = $1 ORDER BY uploaddate DESC LIMIT 1",
      [professor]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json({ jsondata: [] }); 
    }
  } catch (error) {
    console.error("Error fetching professor availability data:", error);
    res
      .status(500)
      .json({ error: "Error fetching professor availability data" });
  }
});


module.exports = router;

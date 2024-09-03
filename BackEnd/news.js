const express = require("express");
const router = express.Router();
const pool = require("./dataBase");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const handleError = (res, error, message = "An error occurred") => {
  console.error(message, error);
  res.status(500).json({ success: false, message });
};

router.post("/add", upload.single("image"), async (req, res) => {
  const { title, description, levels } = req.body;
  const image = req.file ? req.file.buffer : null;
  const levelsArray = JSON.parse(levels);

  try {
    const now = new Date();
    const dateString = now.toISOString();
    await pool.query(
      "INSERT INTO news (title, description, uploadDate, image) VALUES ($1, $2, $3, $4)",
      [title, description, dateString, image]
    );

    const temp = await pool.query(
      "SELECT id FROM news ORDER BY uploadDate DESC LIMIT 1"
    );
    const id = parseInt(temp.rows[0].id);

    for (let i = 0; i < levelsArray.length; i++) {
      const curUsers = await pool.query(
        "SELECT * FROM _user WHERE grade = ($1)",
        [2025 - levelsArray[i]]
      );
      for (let j = 0; j < curUsers.rows.length; j++) {
        await pool.query(
          "INSERT INTO notifications (newsId, email, isNew) VALUES ($1, $2, $3)",
          [id, curUsers.rows[j].email, 1]
        );
      }
    }

    res.json({
      success: true,
      message: "News added and notification created successfully.",
    });
  } catch (error) {
    handleError(res, error, "Error inserting data");
  }
});

router.get("/get", async (req, res) => {
  try {
    const { id } = req.query;

    if (id) {
      const result = await pool.query("SELECT * FROM news WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "News not found." });
      }

      const newsItem = result.rows[0];
      newsItem.image = `data:image/jpeg;base64,${newsItem.image.toString(
        "base64"
      )}`;
      res.status(200).json(newsItem);
    } else {
      const result = await pool.query(
        "SELECT * FROM news ORDER BY uploadDate DESC"
      );
      const newsItems = result.rows.map((item) => ({
        ...item,
        image: `data:image/jpeg;base64,${item.image.toString("base64")}`,
      }));

      res.status(200).json({ cards: newsItems });
    }
  } catch (error) {
    handleError(res, error, "Error fetching data");
  }
});

router.put("/update", upload.single("image"), async (req, res) => {
  const { id } = req.query;
  const { title, description } = req.body;
  const image = req.file ? req.file.buffer : null;

  try {
    console.log(
      `Updating news with ID: ${id}, Title: ${title}, Description: ${description}, Image: ${
        image ? "Exists" : "No image"
      }`
    );

    let updateQuery =
      "UPDATE news SET title = $1, description = $2, uploadDate = $3";
    const values = [title, description, new Date().toISOString()];

    if (image) {
      updateQuery += ", image = $4 WHERE id = $5";
      values.push(image, id);
    } else {
      updateQuery += " WHERE id = $4";
      values.push(id);
    }

    console.log(`Executing Query: ${updateQuery} with values ${values}`);

    await pool.query(updateQuery, values);
    res.json({ success: true, message: "News updated successfully." });
  } catch (error) {
    console.error("Error updating news:", error);
    res.status(500).json({ success: false, message: "Error updating data" });
  }
});
router.delete("/delete", async (req, res) => {
  try {
    const id = req.query.id; 
    console.log(`Deleting news item with ID: ${id}`); 

    const result = await pool.query("DELETE FROM news WHERE id = $1", [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "News item not found." });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting news:", error);
    res.status(500).json({ success: false, message: "Failed to delete news." });
  }
});

module.exports = router;

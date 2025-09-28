import pool from "../config/db.js";

class TagsController {
  async createTag(req, res) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).send("Tag name is required");
      }
      const result = await pool.query(
        "INSERT INTO tags (name) VALUES ($1) RETURNING *;",
        [name]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      if (err.code === "23505") {
        return res.status(400).send("Tag already exists");
      }
      res.status(500).send("Error creating tag");
    }
  }

  async getTags(req, res) {
    try {
      const result = await pool.query(`SELECT * FROM tags ORDER BY name;`);

      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching tags");
    }
  }
}
export default new TagsController();

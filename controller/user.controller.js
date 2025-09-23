import pool from "../config/db.js";

class UserController {
  async createUser(req, res) {
    try {
      const { username, email, password, role } = req.body;
      const result = await pool.query(
        "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
        [username, email, password, role || "author"]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error creting user");
    }
  }

  async getUsers(req, res) {
    try {
      const result = await pool.query(
        "SELECT id, username, email, role, created_at FROM users"
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching users");
    }
  }
}

export default new UserController();

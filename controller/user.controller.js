import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class UserController {

  async loginUser(req, res) {
    try {
      const { email, password } = req.body;
      const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(400).send("User not found");
      }
      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).send("Invalid email or password");
      }

      const token = jwt.sign(
        { id:user.id, role:user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES}
      );

      user.token = token;
      delete user.password;
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error logging in");
    } 
  }

  async createUser(req, res) {
    try {
      const { username, email, password, role } = req.body;
      const hash = await bcrypt.hash(password, 10);
      const result = await pool.query(
        "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
        [username, email, hash, role || "author"]
      );

      const user = result.rows[0];
      delete user.password;
      res.json(user);
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

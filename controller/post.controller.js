import pool from "../config/db.js";

class PostController {
  async createPost(req, res) {
    try {
      const { title, content, status, author_id } = req.body;
      const result = await pool.query(
        "INSERT INTO posts (title, content, status, author_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [title, content, status || "draft", author_id]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error creating post");
    }
  }

  async getPosts(req, res) {
    try {
      const result = await pool.query(
        "SELECT * FROM posts ORDER BY created_at DESC"
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching posts");
    }
  }

  async getPostById(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query("SELECT * FROM posts WHERE id = $1", [
        id,
      ]);
      if (result.rows.length === 0) {
        return res.status(404).send("Post not found");
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching post");
    }
  }

  async updatePost(req, res) {
    try {
      const { id } = req.params;
      const { title, content, status } = req.body;
      const result = await pool.query(
        "UPDATE posts SET title = $1, content = $2, status = $3 WHERE id = $4 RETURNING *",
        [title, content, status, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).send("Post not found");
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error updating post");
    }
  }

  async deletePost(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query(
        "DELETE FROM posts WHERE id = $1 RETURNING *",
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).send("Post not found");
      }
      res.json({ message: "Post deleted", post: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error deleting post");
    }
  }
}

export default new PostController();

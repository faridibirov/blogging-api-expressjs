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

  async getMyPosts(req, res) {
    try {
      const { userId } = req.user.id;
      const result = await pool.query(
        "SELECT * FROM posts WHERE author_id = $1 ORDER BY created_at DESC",
        [userId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching user's posts");
    }
  }

  async getPosts(req, res) {
    try {
      const { author } = req.query;
      let query = "SELECT * FROM posts WHERE status='published'";

      let params = [];

      if (author) {
        query += " AND author_id = $1";
        params.push(author);
      }

      query += " ORDER BY created_at DESC";

      const result = await pool.query(query, params);

      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching posts");
    }
  }

  async getPostById(req, res) {
    try {
      const { id } = req.params;

      const postResult = await pool.query(
        "SELECT p.id, p.title, p.content, p.status, p.created_at, p.author_id, u.username AS author " +
          "FROM posts p JOIN users u ON p.author_id = u.id WHERE p.id = $1",
        [id]
      );

      if (postResult.rows.length === 0) {
        return res.status(404).send("Post not found");
      }

      const post = postResult.rows[0];

      const commentsResult = await pool.query(
        `SELECT c.id, c.content, c.created_at, u.username AS commenter ` +
          `FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = $1 ORDER BY c.created_at ASC`,
        [id]
      );

      post.comments = commentsResult.rows;

      if (post.status !== "published") {
        if (
          !req.user ||
          (req.user.role !== "admin" && req.user.id !== post.author_id)
        ) {
          return res
            .status(403)
            .send("Forbidden: Not authorized to view this post");
        }
      }

      res.json(post);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching post with comments");
    }
  }

  async updatePost(req, res) {
    try {
      const { id } = req.params;

      const postResult = await pool.query(
        `SELECT p.id , p.author_id
        FROM posts p
        WHERE p.id = $1`,
        [id]
      );

      if (postResult.rows.length === 0) {
        return res.status(404).send("Post not found");
      }

      const post = postResult.rows[0];

      if (req.user.role !== "admin" && req.user.id !== post.author_id) {
        return res
          .status(403)
          .send("Forbidden: You can only update your own posts");
      }

      const { title, content, status } = req.body;
      const result = await pool.query(
        "UPDATE posts SET title = $1, content = $2, status = $3 WHERE id = $4 RETURNING *",
        [title, content, status, id]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error updating post");
    }
  }

  async deletePost(req, res) {
    try {
      const { id } = req.params;

      const postResult = await pool.query(
        `SELECT p.id , p.author_id
        FROM posts p
        WHERE p.id = $1`,
        [id]
      );

      if (postResult.rows.length === 0) {
        return res.status(404).send("Post not found");
      }

      const post = postResult.rows[0];

      if (req.user.role !== "admin" && req.user.id !== post.author_id) {
        return res
          .status(403)
          .send("Forbidden: You can only delete your own posts");
      }
      const result = await pool.query(
        "DELETE FROM posts WHERE id = $1 RETURNING *",
        [id]
      );

      res.json({ message: "Post deleted", post: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error deleting post");
    }
  }
}

export default new PostController();

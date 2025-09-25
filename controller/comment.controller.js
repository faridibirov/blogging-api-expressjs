import pool from "../config/db.js";

class CommentController {
  async createComment(req, res) {
    try {
      const { content, post_id, user_id  } = req.body;
      const result = await pool.query(
        "INSERT INTO comments (content, post_id, user_id) VALUES ($1, $2, $3) RETURNING *",
        [content, post_id, user_id]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error creating comment");
    }
  }

  async getCommentsByPost(req, res) {
    try {
        const {postId} = req.params;

        const result = await pool.query(
            `SELECT c.id, c.content, c.created_at, u.username
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.post_id = $1
         ORDER BY c.created_at ASC`,
            [postId]
        );

      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching comments");
    }
  }


  async deleteComment(req, res) {
    try {
      const { id } = req.params;
      
      const commentResult = await pool.query(
        `SELECT c.id, c.post_id, p.author_id
        FROM comments c
        JOIN posts p ON c.post_id = p.id
        WHERE c.id = $1`,
        [id]
      );

      if (commentResult.rows.length === 0) {
        return res.status(404).send("Comment not found");
      }

      const comment = commentResult.rows[0];

      if (req.user.role !== 'admin' && req.user.id !== comment.author_id) {
        return res.status(403).send("Forbidden: Only post author or admin can delete comments");
      }
      
      const result = await pool.query(
        "DELETE FROM comments WHERE id = $1 RETURNING *",
        [id]
      );

      res.json({ message: "Comment deleted", comment: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error deleting comment");
    }
  }
}

export default new CommentController();

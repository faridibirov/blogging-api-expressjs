import pool from "../config/db.js";

class PostController {
  async createPost(req, res) {
    try {
      const { title, content, status, tags } = req.body;
      const result = await pool.query(
        "INSERT INTO posts (title, content, status, author_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [title, content, status || "draft", req.user.id]
      );

      const post = result.rows[0];

      if (tags && tags.length > 0) {
        for (let tagName of tags) {
          let tagResult = await pool.query(
            "SELECT id FROM tags WHERE name = $1",
            [tagName]
          );
          let tagId;

          if (tagResult.rows.length === 0) {
            const newTag = await pool.query(
              "INSERT INTO tags (name) VALUES ($1) RETURNING id",
              [tagName]
            );
            tagId = newTag.rows[0].id;
          } else {
            tagId = tagResult.rows[0].id;
          }
          await pool.query(
            "INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)",
            [post.id, tagId]
          );
        }
      }
      res.json(post);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error creating post");
    }
  }

  async getMyPosts(req, res) {
    try {
      const userId = req.user.id;
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
      const { author, search, tag, page = 1, limit = 5 } = req.query;
      let query = `SELECT p.*, u.username AS author, 
          COALESCE(array_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags
          FROM posts p
          JOIN users u ON p.author_id = u.id 
          LEFT JOIN post_tags pt ON p.id = pt.post_id
          LEFT JOIN tags t ON pt.tag_id = t.id
          WHERE p.status = 'published'`;

      let params = [];

      if (author) {
        query += ` AND p.author_id = $${params.length + 1}`;
        params.push(author);
      }
      if (search) {
        query += ` AND (p.title ILIKE $${
          params.length + 1
        } OR p.content ILIKE $${params.length + 1})`;
        params.push(`%${search}%`);
      }
      if (tag) {
        query += ` AND EXISTS ( SELECT 1 FROM post_tags pt2 JOIN tags t2 ON pt2.tag_id = t2.id  WHERE pt2.post_id = p.id AND t2.name = $${
          params.length + 1
        })`;
        params.push(tag);
      }

      query += ` GROUP BY p.id, u.username
                 ORDER BY p.created_at DESC
                 LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

      params.push(limit);
      params.push((page - 1) * limit);

      const result = await pool.query(query, params);

      res.json({
        page: Number(page),
        limit: Number(limit),
        count: result.rows.length,
        posts: result.rows,
      });
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

      const tagsResult = await pool.query(
        `SELECT t.name FROM post_tags pt JOIN tags t ON pt.tag_id = t.id WHERE pt.post_id = $1;`,
        [id]
      );

      post.comments = commentsResult.rows;
      post.tags = tagsResult.rows.map((row) => row.name);

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

      const { title, content, status, tags } = req.body;
      const result = await pool.query(
        "UPDATE posts SET title = $1, content = $2, status = $3 WHERE id = $4 RETURNING *",
        [title, content, status, id]
      );

      if (tags && tags.length > 0) {
        await pool.query("DELETE FROM post_tags WHERE post_id = $1", [id]);
        for (let tagName of tags) {
          let tagResult = await pool.query(
            "SELECT id FROM tags WHERE name = $1",
            [tagName]
          );
          let tagId;

          if (tagResult.rows.length === 0) {
            const newTag = await pool.query(
              "INSERT INTO tags (name) VALUES ($1) RETURNING id",
              [tagName]
            );
            tagId = newTag.rows[0].id;
          } else {
            tagId = tagResult.rows[0].id;
          }
          await pool.query(
            "INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)",
            [id, tagId]
          );
        }
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

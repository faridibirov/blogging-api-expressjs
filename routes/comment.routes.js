import { Router } from "express";
import commentController from "../controller/comment.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post("/comments", authMiddleware, commentController.createComment);
router.get("/posts/:postId/comments", commentController.getCommentsByPost);
router.delete("/comments/:id", authMiddleware, commentController.deleteComment);

export default router;

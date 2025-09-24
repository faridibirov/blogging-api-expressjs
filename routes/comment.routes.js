import { Router } from "express";
import commentController from "../controller/comment.controller.js";

const router = Router();

router.post("/comments", commentController.createComment);
router.get("/posts/:postId/comments", commentController.getCommentsByPost);
router.delete("/comments/:id", commentController.deleteComment);

export default router;

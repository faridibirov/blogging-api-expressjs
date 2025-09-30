import { Router } from "express";
import postController from "../controller/post.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post("/posts", authMiddleware, postController.createPost);
router.get("/me/posts", authMiddleware, postController.getMyPosts);
router.get("/posts", postController.getPosts);
router.get("/posts/:id", postController.getPostById);
router.put("/posts/:id", authMiddleware, postController.updatePost);
router.delete("/posts/:id", authMiddleware, postController.deletePost);

export default router;

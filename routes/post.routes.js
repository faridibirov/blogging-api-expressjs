import { Router } from "express";
import postController from "../controller/post.controller.js";

const router = Router();

router.post("/posts", postController.createPost);
router.get("/me/posts", postController.getMyPosts);
router.get("/posts", postController.getPosts);
router.get("/posts/:id", postController.getPostById);
router.put("/posts/:id", postController.updatePost);
router.delete("/posts/:id", postController.deletePost);

export default router;

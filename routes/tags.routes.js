import { Router } from "express";
import tagsController from "../controller/tags.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post("/tags",  tagsController.createTag);
router.get("/tags/", tagsController.getTags);

export default router;

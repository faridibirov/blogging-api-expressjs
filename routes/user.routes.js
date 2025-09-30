import { Router } from "express";
import userController from "../controller/user.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post("/users", userController.createUser);
router.get("/users", authMiddleware, userController.getUsers);
router.post("/login", userController.loginUser);

export default router;

import { Router } from "express";
import userController from "../controller/user.controller.js";

const router = Router();

router.post("/users", userController.createUser);
router.get("/users", userController.getUsers);
router.post("/login", userController.loginUser);

export default router;

// src/routes/auth.routes.ts
import { Router } from "express";
import { register, login, getMe, logout, updateProfile, getAllUsers } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateProfile);
router.get("/users", authMiddleware, getAllUsers);

export default router;

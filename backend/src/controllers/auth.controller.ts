import { Request, Response, NextFunction } from "express";
import { RegisterDto, LoginDto } from "../dto/auth.dto";
import { authService } from "../services/auth.service";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Register attempt for email:", req.body.email);
    const data = RegisterDto.parse(req.body);
    const { user, token } = await authService.register(
      data.name,
      data.email,
      data.password
    );

    console.log("Registration successful for user:", user.email);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax"
    });

    const { password, ...userResponse } = user.toObject();

    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Register controller error:", error);
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Login attempt for email:", req.body.email);
    const data = LoginDto.parse(req.body);
    const { user, token } = await authService.login(
      data.email,
      data.password
    );

    console.log("Login successful for user:", user.email);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax"
    });

    const { password, ...userResponse } = user.toObject();

    res.json(userResponse);
  } catch (error) {
    console.error("Login controller error:", error);
    next(error);
  }
};

export const getMe = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const user = await authService.getUserById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const data = req.body; // Validation can be added here or in middleware

  try {
    const updatedUser = await authService.updateProfile(userId, data);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await authService.getAllUsers();
  res.json(users);
};

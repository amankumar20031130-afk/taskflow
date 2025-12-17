// src/services/auth.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/user.repository";
import env from "../config/env";

export const authService = {
  async register(name: string, email: string, password: string) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("USER_EXISTS");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userRepository.create({
      name,
      email,
      password: hashedPassword
    });

    const token = jwt.sign(
      { userId: user._id },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return { user, token };
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error("INVALID_CREDENTIALS");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("INVALID_CREDENTIALS");

    const token = jwt.sign(
      { userId: user._id },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return { user, token };
  },

  async getUserById(userId: string) {
    return userRepository.findById(userId);
  },

  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    return userRepository.update(userId, data);
  },

  async getAllUsers() {
    return userRepository.findAll();
  }
};

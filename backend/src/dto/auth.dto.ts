// src/dto/auth.dto.ts
import { z } from "zod";

export const RegisterDto = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

export const LoginDto = z.object({
  email: z.string().email(),
  password: z.string()
});

export const UpdateProfileDto = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional()
});

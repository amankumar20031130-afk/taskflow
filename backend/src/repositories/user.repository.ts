// src/repositories/user.repository.ts
import { User, IUser } from "../models/user.model";

export const userRepository = {
  findByEmail: (email: string) => User.findOne({ email }),

  findById: (id: string) => User.findById(id).select("-password"),

  create: (data: Partial<IUser>) => User.create(data),

  update: (id: string, data: Partial<IUser>) =>
    User.findByIdAndUpdate(id, data, { new: true }).select("-password"),

  findAll: () => User.find().select("_id name email")
};

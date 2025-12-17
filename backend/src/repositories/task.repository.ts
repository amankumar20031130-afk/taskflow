import { Task } from "../models/task.model";
import { Types } from "mongoose";

export const taskRepository = {
    create: (data: any) => Task.create(data),

    findById: (id: string) => Task.findById(id),

    updateById: (id: string, data: any) =>
        Task.findByIdAndUpdate(id, data, { new: true }),

    deleteById: (id: string) => Task.findByIdAndDelete(id),

    findAll: (filter: any, sort: any) =>
        Task.find(filter).sort(sort).populate("assignedToId", "name")
};

import { Task, ITask } from "../models/task.model";
import { Types } from "mongoose";

export const taskRepository = {
    create: async (data: any): Promise<ITask> => {
        const task = new Task(data);
        return await task.save();
    },

    findById: (id: string) => Task.findById(id),

    updateById: (id: string, data: any): Promise<ITask | null> =>
        Task.findByIdAndUpdate(id, data, { new: true }),

    deleteById: (id: string) => Task.findByIdAndDelete(id),

    findAll: (filter: any, sort: any) =>
        Task.find(filter).sort(sort).populate("assignedToId", "name")
};

import { z } from "zod";
import { TaskPriority, TaskStatus } from "../models/task.model";

export const CreateTaskDto = z.object({
    title: z.string().max(100),
    description: z.string().optional(),
    dueDate: z.string(),
    priority: z.nativeEnum(TaskPriority),
    assignedToId: z.string().optional()
});

export const UpdateTaskDto = z.object({
    title: z.string().max(100).optional(),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    assignedToId: z.string().optional()
});

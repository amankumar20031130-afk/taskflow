import { api } from "./axios";
import type { TaskFormData } from "../validators/task.schema";

export const getTasks = async (params?: {
    status?: string;
    priority?: string;
    sortBy?: string;
    view?: string;
}) => {
    const res = await api.get("/tasks", { params });
    return res.data;
};



export const createTask = async (data: TaskFormData) => {
    const res = await api.post("/tasks", data);
    return res.data;
};

export const updateTask = async (
    taskId: string,
    data: TaskFormData
) => {
    const res = await api.put(`/tasks/${taskId}`, data);
    return res.data;
};

export const deleteTask = async (taskId: string) => {
    await api.delete(`/tasks/${taskId}`);
};

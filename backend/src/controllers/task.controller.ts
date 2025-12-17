import { Request, Response } from "express";
import { CreateTaskDto, UpdateTaskDto } from "../dto/task.dto";
import { taskService } from "../services/task.service";

export const createTask = async (req: Request, res: Response) => {
    const data = CreateTaskDto.parse(req.body);
    const task = await taskService.createTask(data, (req as any).userId);
    res.status(201).json(task);
};

export const getTasks = async (req: Request, res: Response) => {
    const tasks = await taskService.getTasks(
        (req as any).userId,
        req.query
    );
    res.json(tasks);
};

export const updateTask = async (req: Request, res: Response) => {
    const data = UpdateTaskDto.parse(req.body);
    const task = await taskService.updateTask(req.params.id, data, (req as any).userId);
    res.json(task);
};

export const deleteTask = async (req: Request, res: Response) => {
    await taskService.deleteTask(req.params.id);
    res.status(204).send();
};

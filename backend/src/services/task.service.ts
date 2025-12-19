import { taskRepository } from "../repositories/task.repository";
import { TaskStatus } from "../models/task.model";
import { getIO } from "../sockets";
import { Notification } from "../models/notification.model";
import { AuditLog } from "../models/audit.model";

export const taskService = {
    async createTask(data: any, creatorId: string) {
        if (new Date(data.dueDate) < new Date()) {
            throw new Error("DUE_DATE_IN_PAST");
        }

        const task = await taskRepository.create({
            ...data,
            creatorId,
            status: TaskStatus.TODO
        });

        const io = getIO();
        io.emit("task:created", task);

        // 🔔 Assignment notification for new task
        if (data.assignedToId && data.assignedToId !== creatorId) {
            console.log(`[TaskService] Notifying new assignment for task ${task._id} to user ${data.assignedToId}`);
            await Notification.create({
                userId: data.assignedToId,
                message: "You have been assigned a new task"
            });

            io.to(data.assignedToId.toString()).emit("task:assigned", {
                taskId: task._id,
                message: "You have been assigned a new task"
            });
        }

        return task;
    },

    async getTasks(userId: string, query: any) {
        const filter: any = {};
        const sort: any = {};

        if (query.status) filter.status = query.status;
        if (query.priority) filter.priority = query.priority;

        if (query.view === "assigned") {
            filter.assignedToId = userId;
        } else if (query.view === "created") {
            filter.creatorId = userId;
        } else if (query.view === "overdue") {
            filter.dueDate = { $lt: new Date() };
            filter.status = { $ne: TaskStatus.COMPLETED };
            // Overdue tasks should also be relevant to the user
            filter.$or = [{ creatorId: userId }, { assignedToId: userId }];
        } else {
            // Default: Show tasks created by user OR assigned to user
            filter.$or = [{ creatorId: userId }, { assignedToId: userId }];
        }

        if (query.sortBy === "dueDate") {
            sort.dueDate = 1;
        }

        return taskRepository.findAll(filter, sort);
    },

    async updateTask(taskId: string, data: any, userId?: string) {
        // Fetch original task to check for changes if needed
        const originalTask = await taskRepository.findById(taskId);

        const updatedTask = await taskRepository.updateById(taskId, data);

        if (!updatedTask) {
            throw new Error("TASK_NOT_FOUND");
        }

        const io = getIO();
        io.emit("task:updated", updatedTask);

        // 📝 Audit Logging
        if (userId && data.status && originalTask && originalTask.status !== data.status) {
            await AuditLog.create({
                action: "TASK_STATUS_UPDATED",
                entityId: updatedTask._id,
                entityType: "Task",
                userId: userId,
                details: {
                    from: originalTask.status,
                    to: data.status
                }
            });
        }

        // 🔔 Assignment notification
        // Only notify if assignedToId is purposefully changed to a NEW user
        if (
            data.assignedToId &&
            originalTask &&
            originalTask.assignedToId?.toString() !== data.assignedToId.toString()
        ) {
            console.log(`[TaskService] Re-assigning task ${updatedTask._id} from ${originalTask.assignedToId} to ${data.assignedToId}`);

            await Notification.create({
                userId: data.assignedToId,
                message: "You have been assigned a new task"
            });

            io.to(data.assignedToId.toString()).emit("task:assigned", {
                taskId: updatedTask._id,
                message: "You have been assigned a new task"
            });
        }

        return updatedTask;
    },

    async deleteTask(taskId: string) {
        await taskRepository.deleteById(taskId);
        const io = getIO();
        io.emit("task:deleted", taskId);
    }
};

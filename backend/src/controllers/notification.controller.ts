import { Request, Response } from "express";
import { notificationService } from "../services/notification.service";

export const getNotifications = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const notifications = await notificationService.getUserNotifications(userId);
    res.json(notifications);
};

export const markAsRead = async (req: Request, res: Response) => {
    const notification = await notificationService.markAsRead(req.params.id);
    res.json(notification);
};

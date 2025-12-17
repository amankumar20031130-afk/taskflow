import { Notification } from "../models/notification.model";

export const notificationService = {
    async getUserNotifications(userId: string) {
        return Notification.find({ userId }).sort({ createdAt: -1 });
    },

    async markAsRead(notificationId: string) {
        return Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );
    }
};

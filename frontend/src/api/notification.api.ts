import { api } from "./axios";

export interface Notification {
    _id: string;
    userId: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export const getNotifications = async () => {
    const res = await api.get<Notification[]>("/notifications");
    return res.data;
};

export const markAsRead = async (id: string) => {
    const res = await api.patch<Notification>(`/notifications/${id}/read`);
    return res.data;
};

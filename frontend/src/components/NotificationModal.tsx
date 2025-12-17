import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markAsRead } from "../api/notification.api";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "../context/AuthContext";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationModal = ({ isOpen, onClose }: Props) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: notifications = [] } = useQuery({
        queryKey: ["notifications"],
        queryFn: getNotifications,
        enabled: isOpen || !!user // Fetch if open or to check counts
    });

    const markReadMutation = useMutation({
        mutationFn: markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
    });

    // We can listen to socket events here too if we want live updates in the list while open
    // useSocket handles the toast, but we might want to refetch the list
    useSocket(user?._id, () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Notifications</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3">
                    {notifications.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No notifications</p>
                    )}

                    {notifications.map((notif: any) => (
                        <div
                            key={notif._id}
                            className={`p-3 rounded border ${notif.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}
                            onClick={() => !notif.isRead && markReadMutation.mutate(notif._id)}
                        >
                            <p className="text-sm text-gray-800">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {new Date(notif.createdAt).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

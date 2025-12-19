import { useEffect } from "react";
import { socket } from "../socket/socket";
import { toast } from "react-hot-toast";

export const useSocket = (userId: string | undefined, refetch: () => void) => {
    useEffect(() => {
        if (!userId) return;

        console.log("Socket: Joining room for user:", userId);
        socket.emit("join", userId);

        socket.on("task:updated", refetch);
        socket.on("task:created", refetch);
        socket.on("task:deleted", refetch);
        socket.on("task:assigned", (data) => {
            toast.success(data.message);
            refetch();
        });

        return () => {
            socket.off("task:updated");
            socket.off("task:created");
            socket.off("task:deleted");
            socket.off("task:assigned");
        };
    }, [userId, refetch]);
};

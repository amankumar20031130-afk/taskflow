import { io } from "socket.io-client";

const URL = import.meta.env.VITE_BACKEND_URL || "https://taskflow-2r5g.onrender.com";

export const socket = io(URL, {
    withCredentials: true,
    transports: ['websocket', 'polling']
});

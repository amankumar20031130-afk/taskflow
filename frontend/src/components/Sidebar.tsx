
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { EditProfileModal } from "./EditProfileModal";

import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../api/notification.api";
import { NotificationModal } from "./NotificationModal";

export const Sidebar = () => {
    const { user, logout } = useAuth();
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Fetch notifications for badge count
    const { data: notifications = [] } = useQuery({
        queryKey: ["notifications"],
        queryFn: getNotifications,
        enabled: !!user,
        refetchInterval: 5000 // Poll every 5s for now, socket will invalidate too
    });

    const unreadCount = notifications.filter((n: any) => !n.isRead).length;

    // Fallback if user is null (though it shouldn't be rendered if null)
    if (!user) return null;

    // Get initials for avatar
    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        : 'U';

    return (
        <>
            {/* Mobile Header / Toggle */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-900 mx-auto p-4 flex justify-between items-center z-50">
                <h1 className="text-xl font-bold text-blue-400">TaskFlow</h1>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-gray-400 hover:text-white"
                >
                    {/* Hamburger Icon */}
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Sidebar Container */}
            <div className={`
                fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:relative md:translate-x-0 transition duration-200 ease-in-out
                w-64 bg-gray-900 text-white flex flex-col p-4 z-40
            `}>
                <div className="mb-8 hidden md:block">
                    <h1 className="text-2xl font-bold tracking-wider text-blue-400">TaskFlow</h1>
                </div>

                <nav className="flex-1 space-y-2 mt-16 md:mt-0">
                    <div className="px-4 py-3 bg-gray-800 rounded-lg text-blue-300 font-medium cursor-pointer">
                        Dashboard
                    </div>

                    <div
                        onClick={() => setIsNotificationOpen(true)}
                        className="px-4 py-3 hover:bg-gray-800 rounded-lg text-gray-300 font-medium cursor-pointer flex justify-between items-center"
                    >
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                </nav>

                <NotificationModal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />

                <div className="border-t border-gray-700 pt-4 mt-4">
                    <div
                        className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-gray-800 p-2 rounded transition"
                        onClick={() => setIsEditProfileOpen(true)}
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                            {initials}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-medium truncate">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full py-2 px-4 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded transition flex items-center justify-center gap-2"
                    >
                        <span>Logout</span>
                    </button>
                </div>

                <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
            </div>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </>
    );
};

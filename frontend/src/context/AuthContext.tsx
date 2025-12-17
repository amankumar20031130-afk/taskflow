import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/axios";

interface User {
    _id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    setUser: (u: User | null) => void;
    logout: () => void;
    updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/auth/me")
            .then(res => setUser(res.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const logout = () => {
        api.post("/auth/logout").then(() => setUser(null));
    };

    const updateProfile = async (data: { name?: string; email?: string }) => {
        const res = await api.put("/auth/me", data);
        setUser(res.data);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout, updateProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext)!;

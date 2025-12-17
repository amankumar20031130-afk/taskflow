import { api } from "./axios";

export interface UserSummary {
    _id: string;
    name: string;
    email: string;
}

export const getAllUsers = async () => {
    const res = await api.get<UserSummary[]>("/auth/users");
    return res.data;
};

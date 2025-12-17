import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error("ErrorHandler caught:", err);

    // Zod Validation Errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: "Validation Error",
            errors: (err as any).errors
        });
    }

    // Known Logic Errors
    if (err.message === "USER_EXISTS") {
        return res.status(409).json({ message: "User already exists" });
    }

    if (err.message === "INVALID_CREDENTIALS") {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    if (err.message === "Unauthorized") {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (err.message === "TASK_NOT_FOUND") {
        return res.status(404).json({ message: "Task not found" });
    }

    if (err.message === "DUE_DATE_IN_PAST") {
        return res.status(400).json({ message: "Due date cannot be in the past" });
    }

    // MongoDB Cast Errors (Invalid ID)
    if (err.name === "CastError") {
        return res.status(400).json({ message: "Invalid ID format" });
    }

    // Duplicate Key Error (Mongo)
    if (err.code === 11000) {
        return res.status(400).json({ message: "Duplicate value entered" });
    }

    const status = err.status || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
};

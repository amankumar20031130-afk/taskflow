import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema } from "../validators/task.schema";
import type { TaskFormData } from "../validators/task.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTask, updateTask } from "../api/task.api";
import { getAllUsers } from "../api/user.api";
import { toast } from "react-hot-toast";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    task?: any;
}

export const TaskModal = ({ isOpen, onClose, task }: Props) => {
    const queryClient = useQueryClient();

    const { data: users = [] } = useQuery({
        queryKey: ["users"],
        queryFn: getAllUsers
    });

    const form = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        defaultValues: task ? {
            ...task,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "",
            assignedToId: task.assignedToId && typeof task.assignedToId === 'object'
                ? task.assignedToId._id
                : task.assignedToId || ""
        } : {
            title: "",
            description: "",
            dueDate: "",
            priority: "Medium",
            status: "To Do",
            assignedToId: ""
        },
    });

    // Reset form when task changes or modal opens
    /* 
       Note: react-hook-form's defaultValues are cached. 
       Use reset() inside useEffect if specific behavior is needed, 
       but key-changing the component in parent is often cleaner. 
       This current implementation relies on the parent passing new 'task' prop 
       and likely remounting or manual reset logic elsewhere if needed.
       Actually, let's add a reset effect.
    */

    const mutation = useMutation({
        mutationFn: (data: TaskFormData) =>
            task ? updateTask(task._id, data) : createTask(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success(task ? "Task updated!" : "Task created!");
            onClose();
            form.reset();
        },
        onError: (error: any) => {
            console.error("Mutation failed:", error);
            const message = error?.response?.data?.message || error.message || "Failed to save task";
            toast.error(message);
        }
    });

    const onSubmit = (data: TaskFormData) => {
        // If assignedToId is empty string, make it undefined so backend doesn't complain if referencing empty objectId
        if (!data.assignedToId) delete data.assignedToId;
        console.log("Submitting form data:", data);
        mutation.mutate(data);
    };

    const onError = (errors: any) => {
        console.error("Form validation failed:", errors);
        toast.error("Please check the form for errors");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">
                    {task ? "Edit Task" : "Create Task"}
                </h2>

                <form
                    onSubmit={form.handleSubmit(onSubmit, onError)}
                    className="space-y-3"
                >
                    <div>
                        <input
                            {...form.register("title")}
                            placeholder="Title"
                            className="w-full border p-2 rounded"
                        />
                        {form.formState.errors.title && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.title.message}</p>
                        )}
                    </div>

                    <div>
                        <textarea
                            {...form.register("description")}
                            placeholder="Description"
                            className="w-full border p-2 rounded"
                        />
                        {form.formState.errors.description && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.description.message}</p>
                        )}
                    </div>

                    <div>
                        <input
                            type="datetime-local"
                            {...form.register("dueDate")}
                            className="w-full border p-2 rounded"
                        />
                        {form.formState.errors.dueDate && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.dueDate.message}</p>
                        )}
                    </div>

                    <select {...form.register("priority")} className="w-full border p-2">
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Urgent</option>
                    </select>

                    <select {...form.register("status")} className="w-full border p-2">
                        <option>To Do</option>
                        <option>In Progress</option>
                        <option>Review</option>
                        <option>Completed</option>
                    </select>

                    <div>
                        <label className="block text-sm text-gray-500 mb-1">Assign To</label>
                        <select
                            {...form.register("assignedToId")}
                            className="w-full border p-2"
                        >
                            <option value="">Unassigned</option>
                            {users.map((u: any) => (
                                <option key={u._id} value={u._id}>
                                    {u.name} ({u.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                        >
                            {mutation.isPending ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

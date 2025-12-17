import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasks, updateTask, deleteTask } from "../api/task.api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import { TaskModal } from "../components/TaskModal";
import { toast } from "react-hot-toast";

const Dashboard = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Filter and sort state
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [view, setView] = useState("all"); // all, assigned, created, overdue

    const {
        data: tasks = [],
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["tasks", statusFilter, priorityFilter, sortBy, view],
        queryFn: () =>
            getTasks({
                status: statusFilter || undefined,
                priority: priorityFilter || undefined,
                sortBy: sortBy || undefined,
                view: view === "all" ? undefined : view,
            }),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            updateTask(id, { status } as any),
        onMutate: async ({ id, status }) => {
            await queryClient.cancelQueries({ queryKey: ["tasks"] });

            const previousTasks = queryClient.getQueryData(["tasks"]);

            queryClient.setQueryData(["tasks"], (old: any[]) => {
                return old.map((task: any) =>
                    task._id === id ? { ...task, status } : task
                );
            });

            return { previousTasks };
        },
        onError: (_err, _newTask, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(["tasks"], context.previousTasks);
            }
            toast.error("Failed to update task");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        },
        onSuccess: () => {
            toast.success("Task status updated!");
        }
    });

    const deleteTaskMutation = useMutation({
        mutationFn: (id: string) => deleteTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            toast.success("Task deleted!");
        },
        onError: () => {
            toast.error("Failed to delete task");
        }
    });

    // 🔌 Real-time socket updates
    useSocket(user?._id, refetch);

    // 🧩 Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<any>(null);

    if (isLoading) {
        return (
            <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-20 bg-gray-200 rounded animate-pulse"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold">Task Dashboard</h1>

                <button
                    onClick={() => {
                        setSelectedTask(null);
                        setIsModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full md:w-auto"
                >
                    + Create Task
                </button>
            </div>

            {/* View Tabs */}
            <div className="flex border-b mb-6 overflow-x-auto">
                {[
                    { id: "all", label: "All Tasks" },
                    { id: "assigned", label: "Assigned into Me" },
                    { id: "created", label: "Created by Me" },
                    { id: "overdue", label: "Overdue" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setView(tab.id)}
                        className={`px-4 py-2 font-medium whitespace-nowrap transition-colors border-b-2 ${view === tab.id
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border p-2 rounded w-full md:w-auto"
                >
                    <option value="">All Status</option>
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Review</option>
                    <option>Completed</option>
                </select>

                <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="border p-2 rounded w-full md:w-auto"
                >
                    <option value="">All Priority</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                </select>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border p-2 rounded w-full md:w-auto"
                >
                    <option value="">Sort</option>
                    <option value="dueDate">Due Date</option>
                </select>
            </div>

            {/* Task list placeholder (UI will be added later) */}
            <div className="grid gap-4">
                {tasks.length === 0 && (
                    <p className="text-gray-500 text-center">
                        No tasks found
                    </p>
                )}

                {tasks.map((task: any) => (
                    <div
                        key={task._id}
                        onClick={() => {
                            setSelectedTask(task);
                            setIsModalOpen(true);
                        }}
                        className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-md transition relative group"
                    >
                        <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                {task.title}
                                {task.status === "Completed" && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                        ✓ Done
                                    </span>
                                )}
                            </h3>
                            <span className={`text-sm px-2 py-1 rounded ${task.priority === 'Urgent' ? 'bg-red-100 text-red-700' :
                                task.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                {task.priority}
                            </span>
                        </div>

                        <p className="text-gray-600 mt-1 line-clamp-2">
                            {task.description}
                        </p>

                        <div className="flex justify-between items-center text-sm text-gray-500 mt-3 pt-3 border-t">
                            <div className="flex gap-4">
                                <span>Status: {task.status}</span>
                                <span>
                                    Due: {new Date(task.dueDate).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric'
                                    })}
                                </span>
                            </div>

                            {task.status !== "Completed" && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        updateStatusMutation.mutate({
                                            id: task._id,
                                            status: "Completed"
                                        });
                                    }}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition"
                                >
                                    Mark Completed
                                </button>
                            )}

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm("Are you sure you want to delete this task?")) {
                                        deleteTaskMutation.mutate(task._id);
                                    }
                                }}
                                className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Task Create / Edit Modal */}
            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={selectedTask}
            />
        </div>
    );
};

export default Dashboard;

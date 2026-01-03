import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

// Mui
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LogoutIcon from "@mui/icons-material/Logout";

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export default function Tasks() {
  const email = localStorage.getItem("email");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const fetchTasks = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at");

    if (error) {
      setIsLoading(false);
      return;
    }

    setTasks(data as Task[]);
    setIsLoading(false);
  };

  useEffect(() => {
    const loadTasks = async () => {
      await fetchTasks();
    };
    loadTasks();
  }, []);

  const addTask = async () => {
    if (!newTask.trim()) return;

    setIsLoading(true);
    console.log(email);
    const { error } = await supabase
      .from("tasks")
      .insert({ title: newTask, author_email: email });

    if (error) {
      setIsLoading(false);
      return;
    }

    setNewTask("");
    await fetchTasks();
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    setIsLoading(true);

    const { error } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", id);

    if (error) {
      setIsLoading(false);
      return;
    }

    await fetchTasks();
  };

  const deleteTask = async (id: string) => {
    setIsLoading(true);
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      setIsLoading(false);
      alert("failed to delete the task");
      return;
    }
    await fetchTasks();
    setIsLoading(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return;
    navigate("/");
  };

  /* ================= LOADER OUTSIDE UI ================= */
  if (isLoading) {
    return (
      <div className="tasks-container">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <CircularProgress size={48} />
          <span style={{ color: "#94a3b8" }}>Loading tasks...</span>
        </Box>
      </div>
    );
  }
  /* ===================================================== */

  return (
    <div className="tasks-container">
      <Button
        onClick={handleLogout}
        startIcon={<LogoutIcon />}
        sx={{
          position: "fixed",
          top: 16,
          left: 16,
          color: "error.main",
          fontWeight: 600,
          textTransform: "none",
          zIndex: 1000,
          padding: "6px 10px",
          borderRadius: "999px",

          "&:hover": {
            backgroundColor: "rgba(239, 68, 68, 0.08)", // soft red hover
          },
        }}
      >
        Logout
      </Button>
      <div className="tasks-card">
        <h1>My Tasks</h1>

        <div className="task-input">
          <input
            type="text"
            placeholder="New task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />

          <button onClick={addTask}>Add</button>
        </div>

        <ul className="task-list">
          {tasks.length === 0 && <p className="empty">No tasks yet</p>}

          {tasks.map((task) => (
            <li key={task.id} className={task.completed ? "done" : ""}>
              <span onClick={() => toggleTask(task.id)}>{task.title}</span>

              <button className="delete" onClick={() => deleteTask(task.id)}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

// MUI
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LogoutIcon from "@mui/icons-material/Logout";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  image_url?: string | null;
};

export default function Tasks() {
  const email = localStorage.getItem("email");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // UI image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const navigate = useNavigate();

  /* ================= FETCH ================= */

  const fetchTasks = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at");

    if (!error) setTasks(data as Task[]);
    setIsLoading(false);
  };

  useEffect(() => {
    const loadTasks = async () => {
      await fetchTasks();
    };

    loadTasks();
  }, []);

  /* ================= REALTIME ================= */

  useEffect(() => {
    const channel = supabase.channel("tasksChannel");

    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => fetchTasks()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ================= IMAGE UPLOAD ================= */

  const uploadImage = async (file: File): Promise<string | null> => {
    const filePath = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("tasks_images")
      .upload(filePath, file);

    if (error) return null;

    const { data } = await supabase.storage
      .from("tasks_images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  /* ================= ACTIONS ================= */

  const addTask = async () => {
    if (!newTask.trim()) return;

    setIsLoading(true);

    let image_url: string | null = null;
    if (imageFile) image_url = await uploadImage(imageFile);

    await supabase.from("tasks").insert({
      title: newTask,
      author_email: email,
      image_url,
    });

    setNewTask("");
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);

    setIsLoading(false);
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", id);
  };

  const deleteTask = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  /* ================= LOADER ================= */

  if (isLoading) {
    return (
      <div className="tasks-container">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <CircularProgress />
          <span style={{ color: "#94a3b8" }}>Loading…</span>
        </Box>
      </div>
    );
  }

  /* ================= UI ================= */

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
          textTransform: "none",
        }}
      >
        Logout
      </Button>

      <div className="tasks-card">
        <h1>My Tasks</h1>

        {/* ADD TASK */}
        <div className="task-input">
          <input
            type="text"
            placeholder="Write a task… (paste image here)"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onPaste={(e) => {
              const items = e.clipboardData.items;
              for (const item of items) {
                if (item.type.startsWith("image/")) {
                  e.preventDefault();
                  const file = item.getAsFile();
                  if (!file) return;
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                  return;
                }
              }
            }}
          />

          <span className="paste-hint">Tip: Paste image with Ctrl + V</span>

          {/* CUSTOM FILE BUTTON */}
          <label className="image-upload-btn">
            Attach image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
              }}
            />
          </label>

          {/* PREVIEW */}
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="preview" />
              <span>Image ready</span>
            </div>
          )}

          <button onClick={addTask}>Add Task</button>
        </div>

        {/* TASK LIST */}
        <ul className="task-list">
          {tasks.length === 0 && <p className="empty">No tasks yet</p>}

          {tasks.map((task) => (
            <li key={task.id} className={task.completed ? "done" : ""}>
              {task.image_url && <img src={task.image_url} alt="task" />}

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

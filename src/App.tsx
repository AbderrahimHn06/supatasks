import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Tasks from "./Tasks";
import "./App.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { type Session } from "@supabase/supabase-js";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
        return;
      }
      setSession(currentSession);
      if (session) {
        navigate("/tasks");
      }
    };

    fetchSession();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/tasks" element={<Tasks />} />
    </Routes>
  );
}

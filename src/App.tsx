import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Tasks from "./Tasks";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/tasks" element={<Tasks />} />
    </Routes>
  );
}

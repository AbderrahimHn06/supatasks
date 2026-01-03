import { useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async () => {
    setLoading(true);
    setMessage(null);
    if (mode == "signup") {
      setMessage("signed up");
      const { error, data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at");

      setLoading(false);

      if (error) setMessage("faliled");
      else {
        setMessage("success sign up");
        navigate("/tasks");
      }

      console.log(data);
    } else {
      const { error, data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at");

      setLoading(false);

      if (error) setMessage("faliled");
      else {
        setMessage("success log in");
        navigate("/tasks");
      }

      console.log(data);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{mode === "signin" ? "Sign In" : "Sign Up"}</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleAuth} disabled={loading}>
          {loading ? "Loading..." : mode === "signin" ? "Sign In" : "Sign Up"}
        </button>

        <p className="switch">
          {mode === "signin" ? "No account?" : "Already have an account?"}{" "}
          <span
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </span>
        </p>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

import { FormEvent, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type User = { id: number; name: string; email: string };

export default function App() {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("");

    try {
      if (mode === "register") {
        const r = await axios.post(`${API}/auth/register`, { name, email, password });
        setMessage(r.data.message);
        setMode("login");
        setPassword("");
        return;
      }

      const r = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem("auth_token", r.data.token);

      const profile = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${r.data.token}` }
      });

      setUser(profile.data.user);
      setMessage("Login successful");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Request failed");
    }
  }

  function logout() {
    localStorage.removeItem("auth_token");
    setUser(null);
    setMessage("Logged out");
  }

  if (user) {
    return (
      <main className="shell">
        <section className="card">
          <p className="eyebrow">PROTECTED DASHBOARD</p>
          <h1>Welcome, {user.name}</h1>
          <p>{user.email}</p>
          <div className="box">
            <strong>Authenticated request successful</strong>
            <span>User ID: {user.id}</span>
            <span>Protected endpoint: GET /api/auth/me</span>
          </div>
          <button onClick={logout}>Log out</button>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <section className="card">
        <p className="eyebrow">SECURE USER AUTHENTICATION</p>
        <h1>{mode === "register" ? "Create account" : "Welcome back"}</h1>
        <p className="muted">Project-based Full Stack Development internship task.</p>

        <form onSubmit={submit}>
          {mode === "register" && (
            <label>Full name
              <input value={name} onChange={e => setName(e.target.value)} minLength={2} maxLength={100} required />
            </label>
          )}
          <label>Email
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <label>Password
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required />
          </label>
          <button type="submit">{mode === "register" ? "Register" : "Login"}</button>
        </form>

        {message && <p className="message">{message}</p>}

        <button className="secondary" onClick={() => {
          setMode(mode === "register" ? "login" : "register");
          setMessage("");
        }}>
          {mode === "register" ? "Already registered? Login" : "Create a new account"}
        </button>
      </section>
    </main>
  );
}

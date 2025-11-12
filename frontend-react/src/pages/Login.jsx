import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
export default function Login() {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = React.useState("login");
  const [name, setName] = React.useState("Rohan");
  const [email, setEmail] = React.useState("rohan@bank.dev");
  const [password, setPassword] = React.useState("Pass@123");
  const [err, setErr] = React.useState(null);
  const [busy, setBusy] = React.useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      nav("/dashboard", { replace: true });
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h1>{mode === "login" ? "Login" : "Register"}</h1>
      <form onSubmit={submit}>
        {mode === "register" && (
          <>
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </>
        )}
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {err && <div className="error">{String(err)}</div>}
        <div className="row">
          <button disabled={busy}>
            {busy
              ? "Please wait…"
              : mode === "login"
              ? "Login"
              : "Create account"}
          </button>
          <button
            type="button"
            onClick={() =>
              setMode((m) => (m === "login" ? "register" : "login"))
            }
          >
            {mode === "login" ? "Need an account?" : "Have an account?"}
          </button>
        </div>
      </form>
    </div>
  );
}

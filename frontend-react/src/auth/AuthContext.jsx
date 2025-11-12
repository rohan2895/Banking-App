import React from "react";
const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
const KEY = "bank.auth";

const AuthContext = React.createContext(null);
export function AuthProvider({ children }) {
  const [token, setToken] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const j = JSON.parse(raw);
        setToken(j.token);
        setUser(j.user);
      }
    } catch {}
    setLoading(false);
  }, []);
  React.useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ token, user }));
  }, [token, user]);

  async function login(email, password) {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function register(name, email, password) {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Register failed");
    setToken(data.token);
    setUser(data.user);
    return data;
  }
  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem(KEY);
  }

  const value = React.useMemo(
    () => ({ token, user, login, register, logout, loading }),
    [token, user, loading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth");
  return ctx;
}

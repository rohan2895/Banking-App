import React from "react";
import { useAuth } from "../auth/AuthContext.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function toJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export default function Accounts() {
  const { token, user } = useAuth();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState(null);
  const [ok, setOk] = React.useState(null);

  const authHeader = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  async function fetchAccounts() {
    setErr(null);
    setOk(null);
    setLoading(true);
    try {
      if (!token) throw new Error("Not logged in. Please login again.");
      const res = await fetch(`${API}/accounts`, { headers: authHeader });
      if (!res.ok) {
        const body = await toJsonSafe(res);
        throw new Error(
          body?.message || `Failed to load accounts (${res.status})`
        );
      }
      setItems(await res.json());
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setLoading(false);
    }
  }

  async function openAccount() {
    setErr(null);
    setOk(null);
    setBusy(true);
    try {
      if (!token) throw new Error("Not logged in. Please login again.");
      const res = await fetch(`${API}/accounts`, {
        method: "POST",
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const body = await toJsonSafe(res);
        throw new Error(
          body?.message || `Create account failed (${res.status})`
        );
      }
      const created = await res.json();
      setOk(`Account #${created.id} opened`);
      await fetchAccounts();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  React.useEffect(() => {
    fetchAccounts();
  }, []); // initial load

  if (loading) return <div className="card">Loading accounts…</div>;

  return (
    <div className="card">
      <h1>Accounts</h1>
      <p className="muted">
        Logged in as: <b>{user?.email ?? "unknown"}</b>
      </p>

      <div className="row" style={{ marginBottom: 12 }}>
        <button
          type="button"
          onClick={openAccount}
          disabled={!token || busy}
          title={
            !token
              ? "Login required"
              : busy
              ? "Please wait…"
              : "Open a new account"
          }
        >
          {busy ? "Opening…" : "Open new account"}
        </button>
        <button type="button" onClick={fetchAccounts} disabled={busy}>
          Refresh
        </button>
      </div>

      {ok && <div className="success">{ok}</div>}
      {err && <div className="error">{err}</div>}

      {items.length === 0 ? (
        <p className="muted">No accounts yet. Click “Open new account”.</p>
      ) : (
        <ul>
          {items.map((a) => (
            <li key={a.id}>
              #{a.id} • {a.type} • {a.ownerEmail} • ₹{a.balance}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

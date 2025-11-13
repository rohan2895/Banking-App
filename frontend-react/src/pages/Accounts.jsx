import React from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import toast from "react-hot-toast";
import { PlusCircle } from "lucide-react";

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

  const authHeader = React.useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  async function fetchAccounts() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`${API}/accounts`, { headers: authHeader });
      if (!res.ok)
        throw new Error(
          (await toJsonSafe(res))?.message || `Failed to load (${res.status})`
        );
      setItems(await res.json());
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setLoading(false);
    }
  }

  async function openAccount() {
    if (!token) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`${API}/accounts`, {
        method: "POST",
        headers: authHeader,
      });
      if (!res.ok)
        throw new Error(
          (await toJsonSafe(res))?.message ||
            `Create account failed (${res.status})`
        );
      const created = await res.json();
      toast.success(`Account #${created.id} opened`);
      await fetchAccounts();
    } catch (ex) {
      setErr(ex.message);
      toast.error(ex.message);
    } finally {
      setBusy(false);
    }
  }

  React.useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <div className="card">
      <h1>Accounts</h1>
      <p className="muted">
        Logged in as: <b>{user?.email}</b>
      </p>

      <div className="row" style={{ marginTop: 10, marginBottom: 10 }}>
        <button
          className="btn-accent"
          type="button"
          onClick={openAccount}
          disabled={!token || busy}
        >
          <PlusCircle size={16} style={{ marginRight: 6 }} />{" "}
          {busy ? "Opening…" : "Open new account"}
        </button>
        <button
          className="btn-ghost"
          type="button"
          onClick={fetchAccounts}
          disabled={busy}
        >
          Refresh
        </button>
      </div>

      {err && <div className="error">Error: {err}</div>}

      {loading ? (
        <p className="muted">Loading accounts…</p>
      ) : items.length === 0 ? (
        <div className="empty">
          <img
            alt="Illustration"
            src="https://illustrations.popsy.co/blue/savings.svg"
          />
          <div>
            <h3 style={{ margin: "0 0 4px" }}>No accounts yet</h3>
            <p className="muted" style={{ margin: 0 }}>
              Click “Open new account” to get started.
            </p>
          </div>
        </div>
      ) : (
        <div className="list">
          {items.map((a) => (
            <div className="tile" key={a.id}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <h3 style={{ margin: 0 }}>
                  #{a.id} {a.type}
                </h3>
                <span className="badge">Active</span>
              </div>
              <div className="kv">
                <span>Owner</span>
                <span>{a.ownerEmail}</span>
              </div>
              <div className="kv">
                <span>Balance</span>
                <span>₹{a.balance}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

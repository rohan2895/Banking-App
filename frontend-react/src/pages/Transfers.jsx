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

export default function Transfers() {
  const { token, user } = useAuth();
  const [fromId, setFromId] = React.useState("");
  const [toId, setToId] = React.useState("");
  const [amount, setAmount] = React.useState("100");
  const [ok, setOk] = React.useState(null);
  const [err, setErr] = React.useState(null);
  const [busy, setBusy] = React.useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setBusy(true);

    try {
      if (!token) throw new Error("Not logged in. Please login again.");

      // Input validation
      if (!fromId || !toId || !amount) {
        throw new Error("All fields are required.");
      }
      if (fromId === toId) {
        throw new Error("From and To accounts cannot be the same.");
      }
      if (Number(amount) <= 0) {
        throw new Error("Amount must be greater than 0.");
      }

      const res = await fetch(`${API}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fromAccountId: Number(fromId),
          toAccountId: Number(toId),
          amount: Number(amount),
        }),
      });

      const data = await toJsonSafe(res);
      if (!res.ok) {
        throw new Error(data?.message || `Transfer failed (${res.status})`);
      }

      setOk(`Transfer recorded with id ${data.id}`);
      // Clear form after successful submission
      setFromId("");
      setToId("");
      setAmount("100");
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h1>Transfers</h1>
      <p className="muted">
        Logged in as: <b>{user?.email ?? "unknown"}</b>
      </p>
      <form onSubmit={submit}>
        <label>From Account ID</label>
        <input
          type="number"
          value={fromId}
          onChange={(e) => setFromId(e.target.value)}
          disabled={busy}
        />
        <label>To Account ID</label>
        <input
          type="number"
          value={toId}
          onChange={(e) => setToId(e.target.value)}
          disabled={busy}
        />
        <label>Amount</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={busy}
        />
        <div className="row">
          <button
            type="submit"
            disabled={!token || busy}
            title={
              !token
                ? "Login required"
                : busy
                ? "Processing..."
                : "Send transfer"
            }
          >
            {busy ? "Processing…" : "Transfer"}
          </button>
        </div>
      </form>
      {ok && <div className="success">{ok}</div>}
      {err && <div className="error">{err}</div>}
      <p className="muted">
        Phase 1: records a transaction entry. Balance updates wired in Phase 2.
      </p>
    </div>
  );
}

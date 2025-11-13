import React from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Transfers() {
  const { token } = useAuth();
  const [fromId, setFromId] = React.useState("");
  const [toId, setToId] = React.useState("");
  const [amount, setAmount] = React.useState("100");
  const [busy, setBusy] = React.useState(false);

  async function submit(e) {
    e.preventDefault();
    try {
      setBusy(true);
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
      if (!res.ok) throw new Error(`Transfer failed (${res.status})`);
      const data = await res.json();
      toast.success(`Transfer recorded (#${data.id})`);
    } catch (ex) {
      toast.error(ex.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h1>Transfers</h1>
      <form
        onSubmit={submit}
        className="row"
        style={{ alignItems: "flex-end" }}
      >
        <div style={{ minWidth: 220 }}>
          <label>From Account ID</label>
          <input
            value={fromId}
            onChange={(e) => setFromId(e.target.value)}
            placeholder="e.g. 1"
          />
        </div>
        <div style={{ minWidth: 220 }}>
          <label>To Account ID</label>
          <input
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            placeholder="e.g. 2"
          />
        </div>
        <div style={{ minWidth: 160 }}>
          <label>Amount</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <button className="btn-accent" disabled={busy}>
          {busy ? "Processing…" : "Transfer"}
        </button>
      </form>
      <div className="empty" style={{ marginTop: 12 }}>
        <img
          alt="Transfers"
          src="https://illustrations.popsy.co/blue/wallet.svg"
        />
        <p className="muted" style={{ margin: 0 }}>
          This POC records transactions; balance updates come in Phase-2.
        </p>
      </div>
    </div>
  );
}

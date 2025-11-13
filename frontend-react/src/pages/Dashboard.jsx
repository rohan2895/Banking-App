import React from "react";
import { Banknote, CreditCard } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="card">
      <h1>Dashboard</h1>
      <p className="muted">Overview of your banking profile.</p>
      <div className="list">
        <div className="tile">
          <Banknote />
          <h3>Accounts</h3>
          <p className="muted">Open multiple savings/current accounts.</p>
        </div>
        <div className="tile">
          <CreditCard />
          <h3>Transfers</h3>
          <p className="muted">Move money quickly and securely.</p>
        </div>
      </div>
    </div>
  );
}

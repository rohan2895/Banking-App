import React from "react";
import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Accounts from "./pages/Accounts.jsx";
import Transfers from "./pages/Transfers.jsx";
import { AuthProvider, useAuth } from "./auth/AuthContext.jsx";
import { Banknote, CreditCard, Wallet } from "lucide-react";

function Nav() {
  const { user, logout } = useAuth();
  return (
    <nav className="topbar">
      <div
        className="brand"
        style={{ display: "flex", alignItems: "center", gap: 8 }}
      >
        <Wallet size={20} /> Banking App
      </div>
      <div className="spacer" />
      {user && (
        <span className="muted">
          Hi, <b>{user.name}</b>
        </span>
      )}
      <NavLink
        to="/dashboard"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        Dashboard
      </NavLink>
      <NavLink
        to="/accounts"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        Accounts
      </NavLink>
      <NavLink
        to="/transfers"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        Transfers
      </NavLink>
      {user ? (
        <button className="btn-ghost" onClick={logout}>
          Logout
        </button>
      ) : (
        <NavLink
          to="/login"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Login
        </NavLink>
      )}
    </nav>
  );
}

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="card">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="container">
        <Nav />
        <div className="hero">
          <img
            alt="Hero"
            src="https://images.unsplash.com/photo-1553729784-e91953dec042?q=80&w=1600&auto=format&fit=crop"
          />
          <div className="overlay" />
          <div className="text">
            <div className="badge">Secure • Fast • Simple</div>
            <h2 style={{ margin: "8px 0 0" }}>
              Your money, beautifully managed.
            </h2>
          </div>
        </div>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/accounts"
            element={
              <Protected>
                <Accounts />
              </Protected>
            }
          />
          <Route
            path="/transfers"
            element={
              <Protected>
                <Transfers />
              </Protected>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

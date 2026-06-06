import React, { useState } from "react";
import Auth from "./pages/Auth.jsx";
import { ToastViewport } from "./components/feedback.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Landing from "./pages/Landing.jsx";
import { clearSession, getStoredUser, getToken } from "./lib/api.js";

export default function App() {
  const [screen, setScreen] = useState(getToken() ? "app" : "landing");
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(getStoredUser());
  const [toasts, setToasts] = useState([]);

  function notify(toast) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((items) => [...items, { id, type: "info", ...toast }]);
  }

  function dismissToast(id) {
    setToasts((items) => items.filter((toast) => toast.id !== id));
  }

  function renderWithToasts(children) {
    return (
      <>
        {children}
        <ToastViewport toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  if (screen === "landing") {
    return renderWithToasts(<Landing isAuthenticated={Boolean(user)} onDashboard={() => setScreen("app")} onAuth={(mode) => { setAuthMode(mode); setScreen("auth"); }} />);
  }

  if (screen === "auth") {
    return renderWithToasts(
      <Auth
        mode={authMode}
        onModeChange={setAuthMode}
        onBack={() => setScreen("landing")}
        onDone={(nextUser) => { setUser(nextUser); setScreen("app"); }}
        notify={notify}
      />
    );
  }

  return renderWithToasts(
    <Dashboard
      user={user}
      onHome={() => setScreen("landing")}
      onUserChange={setUser}
      notify={notify}
      onLogout={() => {
        clearSession();
        setUser(null);
        setScreen("landing");
      }}
    />
  );
}

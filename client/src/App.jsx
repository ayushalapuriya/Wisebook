import React, { useState } from "react";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Landing from "./pages/Landing.jsx";
import { clearSession, getStoredUser, getToken } from "./lib/api.js";

export default function App() {
  const [screen, setScreen] = useState(getToken() ? "app" : "landing");
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(getStoredUser());

  if (screen === "landing") {
    return <Landing isAuthenticated={Boolean(user)} onDashboard={() => setScreen("app")} onAuth={(mode) => { setAuthMode(mode); setScreen("auth"); }} />;
  }

  if (screen === "auth") {
    return (
      <Auth
        mode={authMode}
        onModeChange={setAuthMode}
        onBack={() => setScreen("landing")}
        onDone={(nextUser) => { setUser(nextUser); setScreen("app"); }}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      onHome={() => setScreen("landing")}
      onUserChange={setUser}
      onLogout={() => {
        clearSession();
        setUser(null);
        setScreen("landing");
      }}
    />
  );
}

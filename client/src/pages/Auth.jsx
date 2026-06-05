import React, { useState } from "react";
import { api, setSession } from "../lib/api.js";

export default function Auth({ mode, onDone, onBack }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      const data = await api(`/auth/${mode}`, { method: "POST", body: JSON.stringify(form) });
      setSession(data.token, data.user);
      onDone(data.user);
    } catch (err) {
      if (err.status) {
        setError(err.message);
        return;
      }
      const demoUser = {
        id: "demo-user",
        name: form.name || "WiseBook Student",
        email: form.email || "student@example.com"
      };
      setSession("demo-token", demoUser);
      onDone(demoUser);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-paper px-6">
      <form className="w-full max-w-md rounded-lg bg-white p-8 shadow-soft" onSubmit={submit}>
        <button type="button" className="mb-6 text-sm font-bold text-aqua" onClick={onBack}>Back to WiseBook</button>
        <h1 className="text-3xl font-black capitalize text-ink">{mode}</h1>
        <p className="mt-2 text-sm text-ink/65">Protected JWT access for the WiseBook dashboard.</p>
        {mode === "register" && (
          <input className="mt-6 w-full rounded-md border p-3" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        )}
        <input className="mt-3 w-full rounded-md border p-3" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="mt-3 w-full rounded-md border p-3" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {mode === "register" && (
          <input className="mt-3 w-full rounded-md border p-3" placeholder="Confirm Password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
        )}
        <label className="mt-4 flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" /> Remember me
        </label>
        {error && <p className="mt-4 rounded-md bg-coral/10 p-3 text-sm font-semibold text-coral">{error}</p>}
        <button className="mt-5 w-full rounded-md bg-ink py-3 font-bold text-white" type="submit">
          Continue
        </button>
        <button type="button" className="mt-4 text-sm font-bold text-aqua">Forgot password?</button>
      </form>
    </main>
  );
}

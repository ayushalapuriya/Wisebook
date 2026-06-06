import React, { useState } from "react";
import { api, setSession } from "../lib/api.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getValidationErrors(form, mode) {
  const nextErrors = {};
  const email = form.email.trim();

  if (mode === "register" && form.name.trim().length < 2) {
    nextErrors.name = "Enter your full name.";
  }

  if (!email) {
    nextErrors.email = "Email is required.";
  } else if (!emailPattern.test(email)) {
    nextErrors.email = "Enter a valid email address.";
  }

  if (!form.password) {
    nextErrors.password = "Password is required.";
  } else if (mode === "register" && form.password.length < 8) {
    nextErrors.password = "Use at least 8 characters.";
  }

  if (mode === "register" && form.confirmPassword !== form.password) {
    nextErrors.confirmPassword = "Passwords must match.";
  }

  return nextErrors;
}

export default function Auth({ mode, onModeChange, onDone, onBack }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === "register";

  function updateField(field, value) {
    setForm({ ...form, [field]: value });
    setFieldErrors({ ...fieldErrors, [field]: "" });
  }

  function switchMode(nextMode) {
    setError("");
    setFieldErrors({});
    setForm({ name: "", email: "", password: "", confirmPassword: "" });
    onModeChange(nextMode);
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    const nextErrors = getValidationErrors(form, mode);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase()
      };
      const data = await api(`/auth/${mode}`, { method: "POST", body: JSON.stringify(payload) });
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
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-paper px-6">
      <form className="w-full max-w-md rounded-lg bg-white p-8 shadow-soft" onSubmit={submit} noValidate>
        <button type="button" className="mb-6 text-sm font-bold text-aqua" onClick={onBack}>Back to WiseBook</button>
        <h1 className="text-3xl font-black capitalize text-ink">{isRegister ? "Sign up" : "Sign in"}</h1>
        <p className="mt-2 text-sm text-ink/65">Protected JWT access for the WiseBook dashboard.</p>
        {isRegister && (
          <label className="mt-6 block">
            <span className="text-sm font-bold text-ink/75">Full name</span>
            <input className="mt-1 w-full rounded-md border p-3" placeholder="Full Name" value={form.name} onChange={(e) => updateField("name", e.target.value)} />
            {fieldErrors.name && <span className="mt-1 block text-xs font-semibold text-coral">{fieldErrors.name}</span>}
          </label>
        )}
        <label className={isRegister ? "mt-3 block" : "mt-6 block"}>
          <span className="text-sm font-bold text-ink/75">Email</span>
          <input className="mt-1 w-full rounded-md border p-3" placeholder="Email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
          {fieldErrors.email && <span className="mt-1 block text-xs font-semibold text-coral">{fieldErrors.email}</span>}
        </label>
        <label className="mt-3 block">
          <span className="text-sm font-bold text-ink/75">Password</span>
          <input className="mt-1 w-full rounded-md border p-3" placeholder="Password" type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)} />
          {fieldErrors.password && <span className="mt-1 block text-xs font-semibold text-coral">{fieldErrors.password}</span>}
        </label>
        {isRegister && (
          <label className="mt-3 block">
            <span className="text-sm font-bold text-ink/75">Confirm password</span>
            <input className="mt-1 w-full rounded-md border p-3" placeholder="Confirm Password" type="password" value={form.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)} />
            {fieldErrors.confirmPassword && <span className="mt-1 block text-xs font-semibold text-coral">{fieldErrors.confirmPassword}</span>}
          </label>
        )}
        <label className="mt-4 flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" /> Remember me
        </label>
        {error && <p className="mt-4 rounded-md bg-coral/10 p-3 text-sm font-semibold text-coral">{error}</p>}
        <button className="mt-5 w-full rounded-md bg-ink py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
        </button>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          {!isRegister && <button type="button" className="font-bold text-aqua">Forgot password?</button>}
          <button
            type="button"
            className="font-bold text-aqua"
            onClick={() => switchMode(isRegister ? "login" : "register")}
          >
            {isRegister ? "Already have an account? Sign in" : "New to WiseBook? Sign up"}
          </button>
        </div>
      </form>
    </main>
  );
}

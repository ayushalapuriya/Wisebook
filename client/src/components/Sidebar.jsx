import React from "react";
import { BarChart3, BookOpen, Brain, FileText, Home, Layers, LogOut, Search, Settings, Upload, User, X } from "lucide-react";

const nav = [
  ["Dashboard", Home],
  ["Upload Notes", Upload],
  ["My Notes", FileText],
  ["AI Summaries", Brain],
  ["Search Notes", Search],
  ["Subjects", Layers],
  ["Analytics", BarChart3],
  ["Profile", User],
  ["Settings", Settings]
];

export default function Sidebar({ active, setActive, onLogout, onHome, open, setOpen }) {
  return (
    <aside className={`${open ? "fixed inset-0 z-30 bg-white p-5" : "hidden"} w-72 border-r border-ink/10 bg-white lg:static lg:block lg:min-h-screen lg:p-5`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xl font-black"><BookOpen className="text-coral" /> WiseBook</div>
        <button className="lg:hidden" onClick={() => setOpen(false)}><X /></button>
      </div>
      <div className="mt-8 space-y-1">
        {nav.map(([label, Icon]) => (
          <button
            key={label}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left font-semibold ${active === label ? "bg-ink text-white" : "text-ink/75 hover:bg-paper"}`}
            onClick={() => { setActive(label); setOpen(false); }}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </div>
      <button className="mt-8 flex w-full items-center gap-3 rounded-md px-3 py-3 font-semibold text-coral" onClick={onLogout}>
        <LogOut className="h-5 w-5" /> Logout
      </button>
      <button className="mt-2 flex w-full items-center gap-3 rounded-md px-3 py-3 font-semibold text-ink/70" onClick={onHome}>
        <Home className="h-5 w-5" /> Home Page
      </button>
    </aside>
  );
}

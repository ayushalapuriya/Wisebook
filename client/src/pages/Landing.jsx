import React from "react";
import { BookOpen, Brain, Cloud, Download, FileSearch, Layers, Search, Sparkles } from "lucide-react";

export default function Landing({ onAuth, isAuthenticated, onDashboard }) {
  const features = [
    ["Handwriting Recognition", FileSearch],
    ["AI Summarization", Sparkles],
    ["Smart Search", Search],
    ["Subject Organization", Layers],
    ["PDF Export", Download],
    ["Cloud Storage", Cloud]
  ];

  return (
    <main className="min-h-screen bg-paper">
      <section className="grid min-h-[92vh] gap-10 px-6 py-8 lg:grid-cols-[1fr_0.9fr] lg:px-16">
        <div className="flex flex-col justify-between">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-2xl font-black text-ink">
              <BookOpen className="h-8 w-8 text-coral" />
              WiseBook
            </div>
            <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white" onClick={isAuthenticated ? onDashboard : () => onAuth("login")}>
              {isAuthenticated ? "Dashboard" : "Login"}
            </button>
          </nav>
          <div className="max-w-3xl py-14">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-aqua">AI note digitization</p>
            <h1 className="text-5xl font-black leading-tight text-ink md:text-7xl">Transform Handwritten Notes into Digital Knowledge</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/75">
              Upload handwritten class notes, extract editable text, generate revision summaries, and search everything by subject, tag, or concept.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-md bg-coral px-5 py-3 font-bold text-white shadow-soft" onClick={isAuthenticated ? onDashboard : () => onAuth("register")}>
                {isAuthenticated ? "Go to Dashboard" : "Get Started"}
              </button>
              <button className="rounded-md border border-ink/20 px-5 py-3 font-bold text-ink" onClick={() => onAuth("login")}>
                Watch Demo
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {["Upload note", "OCR extracts text", "AI creates revision kit"].map((step, index) => (
              <div key={step} className="border-l-4 border-gold bg-white/55 p-4">
                <p className="text-xs font-black text-coral">STEP {index + 1}</p>
                <p className="mt-1 font-bold">{step}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center pb-10 lg:pb-0">
          <div className="relative h-[440px] w-full max-w-[560px] overflow-hidden rounded-lg border border-ink/15 bg-white shadow-soft">
            <div className="notebook-visual absolute left-8 top-8 h-[300px] w-[220px] rotate-[-5deg] rounded-md border border-ink/15 shadow-soft">
              <div className="ml-16 mt-16 h-3 w-28 rounded bg-ink/30" />
              <div className="ml-16 mt-6 h-3 w-36 rounded bg-coral/50" />
              <div className="ml-16 mt-6 h-3 w-24 rounded bg-sage/50" />
              <div className="scan-line absolute left-0 top-0 h-1 w-full bg-aqua" />
            </div>
            <div className="absolute right-8 top-20 rounded-lg bg-ink p-5 text-white shadow-soft">
              <Brain className="mb-3 h-9 w-9 text-gold" />
              <p className="text-sm font-bold uppercase text-white/60">AI Summary</p>
              <p className="mt-2 max-w-[210px] text-xl font-black">Key points, flashcards, viva questions</p>
            </div>
            <div className="absolute bottom-10 right-12 w-[300px] rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
              <p className="text-sm font-black text-aqua">Digital Notes</p>
              <p className="mt-2 text-sm text-ink/70">Searchable by title, subject, tags, content, and summary keywords.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white px-6 py-14 lg:px-16">
        <div className="grid gap-4 md:grid-cols-3">
          {features.map(([label, Icon]) => (
            <div key={label} className="rounded-md border border-ink/10 p-5">
              <Icon className="h-7 w-7 text-coral" />
              <h3 className="mt-4 font-black">{label}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/65">Built into the WiseBook study workflow from the project plan.</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

import React, { useState } from "react";
import { X } from "lucide-react";
import { Loader } from "./feedback.jsx";
import { List, Panel } from "./ui.jsx";

export function ViewNoteModal({ note, onClose, onRegenerate, summaryStatus, summaryLoading }) {
  const summary = note.aiSummary || {};

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink/45 p-4">
      <section className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-md bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-aqua">{note.subjectId?.subjectName || "General"}</p>
            <h2 className="text-2xl font-black">{note.title}</h2>
          </div>
          <button className="rounded-md border p-2" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {note.tags?.map((tag) => <span key={tag} className="rounded bg-paper px-2 py-1 text-xs font-bold">{tag}</span>)}
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <Panel title="Extracted Text">
            <p className="whitespace-pre-wrap text-sm leading-7 text-ink/75">{note.extractedText || "No OCR text saved yet."}</p>
          </Panel>
          <Panel title="AI Summary">
            <p className="text-sm font-semibold leading-7 text-ink/75">{summary.shortSummary || "Summary not generated yet."}</p>
            <button className="mt-4 rounded-md bg-ink px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" onClick={() => onRegenerate(note)} disabled={summaryLoading}>
              {summaryLoading ? <Loader label="Generating" /> : "Generate New Summary"}
            </button>
            {summaryStatus && <p className="mt-3 rounded-md bg-paper p-2 text-sm font-semibold text-ink/70">{summaryStatus}</p>}
          </Panel>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <List title="Key Points" items={summary.keyPoints || []} />
          <List title="Flashcards" items={(summary.flashcards || []).map((card) => `${card.front} ${card.back}`)} />
          <List title="Viva Questions" items={summary.vivaQuestions || []} />
        </div>
      </section>
    </div>
  );
}

export function EditNoteModal({ note, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    title: note.title || "",
    tagsText: (note.tags || []).join(", "),
    extractedText: note.extractedText || ""
  });

  function submit(event) {
    event.preventDefault();
    onSave({
      ...note,
      title: form.title,
      extractedText: form.extractedText,
      tags: form.tagsText.split(",").map((tag) => tag.trim()).filter(Boolean)
    });
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-ink/45 p-4">
      <form className="w-full max-w-3xl rounded-md bg-white p-5 shadow-soft" onSubmit={submit}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black">Edit Note</h2>
          <button type="button" className="rounded-md border p-2" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <input className="mt-5 w-full rounded-md border p-3" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Note title" required />
        <input className="mt-3 w-full rounded-md border p-3" value={form.tagsText} onChange={(event) => setForm({ ...form, tagsText: event.target.value })} placeholder="Tags separated by commas" />
        <textarea className="mt-3 min-h-64 w-full rounded-md border p-3" value={form.extractedText} onChange={(event) => setForm({ ...form, extractedText: event.target.value })} placeholder="Extracted text" />
        <div className="mt-4 flex gap-3">
          <button className="rounded-md bg-coral px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={saving}>
            {saving ? <Loader label="Saving" /> : "Save Changes"}
          </button>
          <button className="rounded-md border px-5 py-3 font-bold" type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

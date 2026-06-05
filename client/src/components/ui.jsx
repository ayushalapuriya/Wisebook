import React from "react";

export function Panel({ title, children }) {
  return <section className="rounded-md bg-white p-5 shadow-sm"><h2 className="mb-4 text-xl font-black">{title}</h2>{children}</section>;
}

export function List({ title, items }) {
  return <div><h4 className="font-black">{title}</h4><ul className="mt-2 space-y-2 text-sm text-ink/70">{items.map((item) => <li key={item} className="rounded bg-paper p-2">{item}</li>)}</ul></div>;
}

export function NoteRow({ note }) {
  return <div className="mb-3 rounded-md border border-ink/10 p-3"><p className="font-bold">{note.title}</p><p className="text-sm text-ink/55">{note.subjectId?.subjectName}</p></div>;
}

export function NoteMetric({ label, value }) {
  return <div className="mb-3 flex items-center justify-between rounded-md bg-paper p-3"><span className="font-bold">{label}</span><span className="text-xl font-black">{value}</span></div>;
}

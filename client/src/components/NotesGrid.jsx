import React from "react";
import { Loader } from "./feedback.jsx";

export default function NotesGrid({ notes, onView, onEdit, onDelete, onDownload, deletingNoteId = "", downloadingNoteId = "" }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {notes.map((note) => {
        const isDeleting = deletingNoteId === note._id;
        const isDownloading = downloadingNoteId === note._id;

        return (
          <div key={note._id} className="rounded-md bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-aqua">{note.subjectId?.subjectName}</p>
            <h3 className="mt-2 text-xl font-black">{note.title}</h3>
            <p className="mt-1 text-xs font-semibold text-ink/45">
              Uploaded {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : "date unavailable"}
            </p>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink/65">{note.extractedText}</p>
            <div className="mt-4 flex flex-wrap gap-2">{note.tags?.map((tag) => <span key={tag} className="rounded bg-paper px-2 py-1 text-xs font-bold">{tag}</span>)}</div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button className="rounded-md border p-2 text-sm font-bold" onClick={() => onView(note)}>View</button>
              <button className="rounded-md border p-2 text-sm font-bold" onClick={() => onEdit(note)}>Edit</button>
              <button className="rounded-md border p-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60" onClick={() => onDelete(note._id)} disabled={isDeleting}>
                {isDeleting ? <Loader label="Deleting" /> : "Delete"}
              </button>
              <button className="rounded-md border p-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60" onClick={() => onDownload(note)} disabled={isDownloading}>
                {isDownloading ? <Loader label="Preparing" /> : "PDF"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

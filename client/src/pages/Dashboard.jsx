import React, { useEffect, useMemo, useState } from "react";
import { Bell, Menu, Plus, Search, Upload } from "lucide-react";
import NotesGrid from "../components/NotesGrid.jsx";
import { EditNoteModal, ViewNoteModal } from "../components/NoteModals.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { List, NoteMetric, NoteRow, Panel } from "../components/ui.jsx";
import { defaultSubjects, demoNotes } from "../data/demo.js";
import { api, clearSession, downloadFile, getToken, setSession } from "../lib/api.js";

export default function Dashboard({ user, onLogout, onHome, onUserChange }) {
  const [active, setActive] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notes, setNotes] = useState(demoNotes);
  const [subjects, setSubjects] = useState(defaultSubjects);
  const [analytics, setAnalytics] = useState(null);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ subject: "", tag: "", fromDate: "", toDate: "" });
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [noteActionError, setNoteActionError] = useState("");
  const [summaryStatus, setSummaryStatus] = useState("");
  const [currentUser, setCurrentUser] = useState(user);
  const [profileStatus, setProfileStatus] = useState("");

  useEffect(() => {
    if (!getToken()) return;
    Promise.all([
      api("/notes").then((data) => setNotes(data.notes)).catch(() => null),
      api("/subjects").then((data) => {
        const savedSubjects = data.subjects.map((item) => item.subjectName).filter(Boolean);
        if (savedSubjects.length > 0) setSubjects(savedSubjects);
      }).catch(() => null),
      api("/analytics").then(setAnalytics).catch(() => null)
    ]);
  }, []);

  const availableSubjects = useMemo(() => {
    const noteSubjects = notes.map((note) => note.subjectId?.subjectName).filter(Boolean);
    return [...new Set([...subjects, ...noteSubjects])].sort((a, b) => a.localeCompare(b));
  }, [notes, subjects]);

  const availableTags = useMemo(() => {
    return [...new Set(notes.flatMap((note) => note.tags || []))].sort((a, b) => a.localeCompare(b));
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const term = query.toLowerCase();
    return notes.filter((note) =>
      {
        const noteDate = note.createdAt ? new Date(note.createdAt) : null;
        const fromDate = filters.fromDate ? new Date(`${filters.fromDate}T00:00:00`) : null;
        const toDate = filters.toDate ? new Date(`${filters.toDate}T23:59:59`) : null;
        const matchesText = !term || [note.title, note.extractedText, note.aiSummary?.shortSummary, note.subjectId?.subjectName, ...(note.tags || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term);
        const matchesSubject = !filters.subject || note.subjectId?.subjectName === filters.subject;
        const matchesTag = !filters.tag || (note.tags || []).includes(filters.tag);
        const matchesFromDate = !fromDate || (noteDate && noteDate >= fromDate);
        const matchesToDate = !toDate || (noteDate && noteDate <= toDate);
        return matchesText && matchesSubject && matchesTag && matchesFromDate && matchesToDate;
      }
    );
  }, [notes, query, filters]);

  async function uploadNote(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setUploadError("");
    setUploading(true);
    const data = new FormData(form);
    try {
      const result = await api("/notes/upload", { method: "POST", body: data });
      setNotes([result.note, ...notes]);
      const uploadedSubject = result.note.subjectId?.subjectName;
      if (uploadedSubject && !subjects.includes(uploadedSubject)) {
        setSubjects([...subjects, uploadedSubject]);
      }
      form.reset();
      setActive("My Notes");
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function viewNote(note) {
    setNoteActionError("");
    try {
      const data = note._id?.startsWith("demo-") ? { note } : await api(`/notes/${note._id}`);
      setSelectedNote(data.note);
    } catch (err) {
      setNoteActionError(err.message);
    }
  }

  async function saveNote(updatedNote) {
    setNoteActionError("");
    try {
      const payload = {
        title: updatedNote.title,
        extractedText: updatedNote.extractedText,
        tags: updatedNote.tags
      };
      const data = updatedNote._id?.startsWith("demo-")
        ? { note: updatedNote }
        : await api(`/notes/${updatedNote._id}`, { method: "PUT", body: JSON.stringify(payload) });
      setNotes(notes.map((note) => (note._id === updatedNote._id ? data.note : note)));
      setEditingNote(null);
    } catch (err) {
      setNoteActionError(err.message);
    }
  }

  async function deleteNote(noteId) {
    setNoteActionError("");
    try {
      if (!noteId.startsWith("demo-")) await api(`/notes/${noteId}`, { method: "DELETE" });
      setNotes(notes.filter((note) => note._id !== noteId));
    } catch (err) {
      setNoteActionError(err.message);
    }
  }

  async function downloadNotePdf(note) {
    setNoteActionError("");
    try {
      if (note._id.startsWith("demo-")) {
        setNoteActionError("Save or upload a real note before downloading PDF.");
        return;
      }
      await downloadFile(`/notes/${note._id}/export/pdf`, `${note.title || "wisebook-note"}.pdf`);
    } catch (err) {
      setNoteActionError(err.message);
    }
  }

  async function regenerateSummary(note) {
    setNoteActionError("");
    setSummaryStatus("Generating new summary...");
    try {
      const data = note._id?.startsWith("demo-")
        ? { note: buildLocalSummary(note) }
        : await api(`/notes/${note._id}/summary`, { method: "POST" });
      setNotes(notes.map((item) => (item._id === note._id ? data.note : item)));
      setSelectedNote(data.note);
      setSummaryStatus("Summary updated.");
    } catch (err) {
      setNoteActionError(err.message);
      setSummaryStatus(`Summary failed: ${err.message}`);
    }
  }

  async function updateProfile(profile) {
    setProfileStatus("Updating profile...");
    try {
      const body = new FormData();
      body.append("name", profile.name);
      body.append("email", profile.email);
      if (profile.profileImageFile) {
        body.append("profileImage", profile.profileImageFile);
      }
      const data = await api("/auth/me", { method: "PUT", body });
      setSession(data.token, data.user);
      setCurrentUser(data.user);
      onUserChange(data.user);
      setProfileStatus("Profile updated successfully.");
    } catch (err) {
      setProfileStatus(err.message);
    }
  }

  async function changePassword(passwords) {
    setProfileStatus("Changing password...");
    try {
      const data = await api("/auth/password", { method: "PUT", body: JSON.stringify(passwords) });
      setProfileStatus(data.message || "Password updated successfully.");
    } catch (err) {
      setProfileStatus(err.message);
    }
  }

  async function deleteAccount() {
    const confirmed = window.confirm("Delete your WiseBook account and all notes? This cannot be undone.");
    if (!confirmed) return;
    setProfileStatus("Deleting account...");
    try {
      await api("/auth/me", { method: "DELETE" });
      clearSession();
      onLogout();
    } catch (err) {
      setProfileStatus(err.message);
    }
  }

  const stats = [
    ["Total Notes", analytics?.totalNotes ?? notes.length],
    ["Total Subjects", analytics?.totalSubjects ?? subjects.length],
    ["AI Summaries", analytics?.summariesGenerated ?? notes.filter((note) => note.aiSummary).length],
    ["This Month", analytics?.notesUploadedThisMonth ?? notes.length]
  ];

  return (
    <main className="flex min-h-screen bg-paper">
      <Sidebar active={active} setActive={setActive} onLogout={onLogout} onHome={onHome} open={menuOpen} setOpen={setMenuOpen} />
      <section className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-ink/10 bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
          <button className="lg:hidden" onClick={() => setMenuOpen(true)}><Menu /></button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-ink/40" />
            <input className="w-full rounded-md border border-ink/10 bg-paper py-3 pl-10 pr-4" placeholder="Search title, subject, tags, content, summaries" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Bell className="h-5 w-5 text-ink/55" />
          <div className="hidden text-right sm:block">
            <p className="font-bold">{currentUser?.name || "WiseBook User"}</p>
            <p className="text-xs text-ink/55">{currentUser?.email || "student@example.com"}</p>
          </div>
        </header>
        <div className="p-4 lg:p-8">
          {active === "Dashboard" && <Overview stats={stats} notes={notes} />}
          {active === "Upload Notes" && <UploadNotes uploadNote={uploadNote} subjects={availableSubjects} uploadError={uploadError} uploading={uploading} />}
          {noteActionError && <p className="mb-4 rounded-md border border-coral/30 bg-coral/10 p-3 text-sm font-semibold text-coral">{noteActionError}</p>}
          {active === "My Notes" && <NotesGrid notes={filteredNotes} onView={viewNote} onEdit={setEditingNote} onDelete={deleteNote} onDownload={downloadNotePdf} />}
          {active === "AI Summaries" && <Summaries notes={filteredNotes} />}
          {active === "Search Notes" && <SearchView notes={filteredNotes} query={query} setQuery={setQuery} filters={filters} setFilters={setFilters} subjects={availableSubjects} tags={availableTags} onView={viewNote} onEdit={setEditingNote} onDelete={deleteNote} onDownload={downloadNotePdf} />}
          {active === "Subjects" && <Subjects subjects={availableSubjects} setSubjects={setSubjects} notes={notes} />}
          {active === "Analytics" && <Analytics notes={notes} stats={stats} />}
          {active === "Profile" && <Profile user={currentUser} status={profileStatus} onUpdate={updateProfile} onPasswordChange={changePassword} onDeleteAccount={deleteAccount} />}
          {active === "Settings" && <SettingsPanel onHome={onHome} onDeleteAccount={deleteAccount} />}
        </div>
        {selectedNote && <ViewNoteModal note={selectedNote} onClose={() => { setSelectedNote(null); setSummaryStatus(""); }} onRegenerate={regenerateSummary} summaryStatus={summaryStatus} />}
        {editingNote && <EditNoteModal note={editingNote} onClose={() => setEditingNote(null)} onSave={saveNote} />}
      </section>
    </main>
  );
}

function buildLocalSummary(note) {
  const pieces = (note.extractedText || "").split(/[.!?\n]/).map((item) => item.trim()).filter(Boolean);
  return {
    ...note,
    aiSummary: {
      shortSummary: pieces.slice(0, 2).join(". ") || "Summary generated from saved note text.",
      keyPoints: pieces.slice(0, 5),
      flashcards: pieces.slice(0, 4).map((item, index) => ({ front: `What is key idea ${index + 1}?`, back: item })),
      vivaQuestions: pieces.slice(0, 3).map((item) => `Explain: ${item}`)
    }
  };
}

function Overview({ stats, notes }) {
  return (
    <>
      <h1 className="text-3xl font-black">Dashboard Overview</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-md bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-ink/55">{label}</p>
            <p className="mt-3 text-4xl font-black">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <Panel title="Recent Activity">
          {notes.slice(0, 4).map((note) => <NoteRow key={note._id} note={note} />)}
        </Panel>
        <Panel title="Monthly Upload Analytics">
          <div className="flex h-56 items-end gap-4">
            {[40, 72, 54, 88, 62, 96].map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t bg-aqua" style={{ height }} />
                <span className="text-xs font-bold text-ink/45">W{index + 1}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

function UploadNotes({ uploadNote, subjects, uploadError, uploading }) {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const visibleSubjects = subjects.length > 0 ? subjects : defaultSubjects;
  const isOtherSubject = selectedSubject === "__other__";

  return (
    <Panel title="Upload Notes">
      <form className="grid gap-4 lg:grid-cols-2" onSubmit={uploadNote}>
        <input name="title" required className="rounded-md border p-3" placeholder="Note Title" />
        <select name={isOtherSubject ? "subjectChoice" : "subjectName"} required className="rounded-md border bg-white p-3 text-ink" value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)}>
          <option value="">Select Subject</option>
          {visibleSubjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
          <option value="__other__">Other</option>
        </select>
        {isOtherSubject && (
          <input name="subjectName" required className="rounded-md border p-3 lg:col-start-2" placeholder="Enter custom subject" value={customSubject} onChange={(event) => setCustomSubject(event.target.value)} />
        )}
        <input name="tags" className="rounded-md border p-3" placeholder="Tags separated by commas" />
        <input name="file" required className="rounded-md border bg-white p-3" type="file" accept=".jpg,.jpeg,.png,.pdf" />
        <textarea className="min-h-40 rounded-md border p-3 lg:col-span-2" placeholder="OCR output appears after upload and remains editable in saved notes." />
        {uploadError && <p className="rounded-md border border-coral/30 bg-coral/10 p-3 text-sm font-semibold text-coral lg:col-span-2">{uploadError}</p>}
        <button className="flex items-center justify-center gap-2 rounded-md bg-coral px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={uploading}>
          <Upload className="h-5 w-5" /> {uploading ? "Processing..." : "Process OCR and Save"}
        </button>
      </form>
    </Panel>
  );
}

function Summaries({ notes }) {
  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <Panel key={note._id} title={note.title}>
          <p className="font-semibold text-ink/75">{note.aiSummary?.shortSummary}</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <List title="Key Points" items={note.aiSummary?.keyPoints || []} />
            <List title="Flashcards" items={(note.aiSummary?.flashcards || []).map((card) => `${card.front} ${card.back}`)} />
            <List title="Viva Questions" items={note.aiSummary?.vivaQuestions || ["Generate a new AI summary to create questions."]} />
          </div>
        </Panel>
      ))}
    </div>
  );
}

function SearchView({ notes, query, setQuery, filters, setFilters, subjects, tags, onView, onEdit, onDelete, onDownload }) {
  function updateFilter(name, value) {
    setFilters({ ...filters, [name]: value });
  }

  function clearFilters() {
    setQuery("");
    setFilters({ subject: "", tag: "", fromDate: "", toDate: "" });
  }

  return (
    <>
      <Panel title="Advanced Search">
        <div className="grid gap-3 md:grid-cols-4">
          <input className="rounded-md border p-3 md:col-span-2" placeholder="Search by title, content, tags, summary" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="rounded-md border bg-white p-3" value={filters.subject} onChange={(e) => updateFilter("subject", e.target.value)}>
            <option value="">All Subjects</option>
            {subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
          </select>
          <select className="rounded-md border bg-white p-3" value={filters.tag} onChange={(e) => updateFilter("tag", e.target.value)}>
            <option value="">All Tags</option>
            {tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
          </select>
          <label className="text-sm font-bold text-ink/60">
            From
            <input className="mt-1 w-full rounded-md border p-3" type="date" value={filters.fromDate} onChange={(e) => updateFilter("fromDate", e.target.value)} />
          </label>
          <label className="text-sm font-bold text-ink/60">
            To
            <input className="mt-1 w-full rounded-md border p-3" type="date" value={filters.toDate} onChange={(e) => updateFilter("toDate", e.target.value)} />
          </label>
          <button className="rounded-md border px-4 py-3 font-bold md:self-end" type="button" onClick={clearFilters}>Clear Filters</button>
          <p className="rounded-md bg-paper p-3 text-sm font-semibold text-ink/65 md:self-end">{notes.length} result{notes.length === 1 ? "" : "s"}</p>
        </div>
      </Panel>
      <div className="mt-4"><NotesGrid notes={notes} onView={onView} onEdit={onEdit} onDelete={onDelete} onDownload={onDownload} /></div>
    </>
  );
}

function Subjects({ subjects, setSubjects, notes }) {
  const [name, setName] = useState("");
  const noteCounts = notes.reduce((acc, note) => {
    const subject = note.subjectId?.subjectName || "General";
    acc[subject] = (acc[subject] || 0) + 1;
    return acc;
  }, {});

  return (
    <Panel title="Subject Management">
      <form className="flex gap-3" onSubmit={(e) => { e.preventDefault(); if (name) setSubjects([...subjects, name]); setName(""); }}>
        <input className="flex-1 rounded-md border p-3" placeholder="Create subject" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="rounded-md bg-ink px-4 text-white"><Plus /></button>
      </form>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <div key={subject} className="rounded-md border border-ink/10 p-4">
            <p className="font-bold">{subject}</p>
            <p className="mt-1 text-sm text-ink/55">{noteCounts[subject] || 0} note{noteCounts[subject] === 1 ? "" : "s"}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Analytics({ notes, stats }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Notes Per Subject">
        {Object.entries(notes.reduce((acc, note) => ({ ...acc, [note.subjectId?.subjectName || "General"]: (acc[note.subjectId?.subjectName || "General"] || 0) + 1 }), {})).map(([subject, count]) => (
          <div key={subject} className="mb-3">
            <div className="mb-1 flex justify-between text-sm font-bold"><span>{subject}</span><span>{count}</span></div>
            <div className="h-3 rounded bg-paper"><div className="h-3 rounded bg-sage" style={{ width: `${Math.min(100, count * 22)}%` }} /></div>
          </div>
        ))}
      </Panel>
      <Panel title="Usage">
        {stats.map(([label, value]) => <NoteMetric key={label} label={label} value={value} />)}
      </Panel>
    </div>
  );
}

function Profile({ user, status, onUpdate, onPasswordChange, onDeleteAccount }) {
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    profileImageFile: null
  });
  const [preview, setPreview] = useState(user?.profileImage || "");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  function selectProfileImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfile({ ...profile, profileImageFile: file });
    setPreview(URL.createObjectURL(file));
  }

  return (
    <Panel title="Profile">
      <div className="flex items-center gap-5">
        {preview ? (
          <img className="h-20 w-20 rounded-full object-cover" src={preview} alt="Profile" />
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-full bg-coral text-2xl font-black text-white">{(user?.name || "W").slice(0, 1)}</div>
        )}
        <div>
          <h2 className="text-2xl font-black">{user?.name || "WiseBook User"}</h2>
          <p className="text-ink/60">{user?.email || "student@example.com"}</p>
        </div>
      </div>
      {status && <p className="mt-5 rounded-md bg-paper p-3 text-sm font-semibold text-ink/70">{status}</p>}
      <form className="mt-6 grid gap-3 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); onUpdate(profile); }}>
        <input className="rounded-md border p-3" placeholder="Name" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
        <input className="rounded-md border p-3" placeholder="Email" type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} />
        <label className="rounded-md border p-3 text-sm font-semibold text-ink/70 md:col-span-2">
          Upload Profile Photo
          <input className="mt-2 block w-full" type="file" accept="image/png,image/jpeg,image/webp" onChange={selectProfileImage} />
        </label>
        <button className="rounded-md bg-ink p-3 font-bold text-white">Update Profile</button>
      </form>
      <form className="mt-6 grid gap-3 md:grid-cols-3" onSubmit={(event) => { event.preventDefault(); onPasswordChange(passwords); }}>
        <input className="rounded-md border p-3" placeholder="Current password" type="password" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} />
        <input className="rounded-md border p-3" placeholder="New password" type="password" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} />
        <input className="rounded-md border p-3" placeholder="Confirm password" type="password" value={passwords.confirmPassword} onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })} />
        <button className="rounded-md border p-3 font-bold md:col-span-1">Change Password</button>
      </form>
      <button className="mt-6 rounded-md border border-coral p-3 font-bold text-coral" onClick={onDeleteAccount}>Delete Account</button>
    </Panel>
  );
}

function SettingsPanel({ onHome, onDeleteAccount }) {
  return (
    <Panel title="Settings">
      {["Voice reading", "Multi-language OCR", "AI chat with notes", "Smart quiz generator", "Study planner"].map((item) => (
        <label key={item} className="mb-3 flex items-center justify-between rounded-md border border-ink/10 p-4 font-bold">
          {item}
          <input type="checkbox" />
        </label>
      ))}
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <button className="rounded-md border p-3 font-bold" onClick={onHome}>Go to Home Page</button>
        <button className="rounded-md border border-coral p-3 font-bold text-coral" onClick={onDeleteAccount}>Delete Account</button>
      </div>
    </Panel>
  );
}

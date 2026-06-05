import express from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { Note } from "../models/Note.js";
import { Subject } from "../models/Subject.js";
import { uploadToCloudinary } from "../services/cloudStorage.js";
import { extractHandwriting } from "../services/ocr.js";
import { streamNotePdf } from "../services/pdfExport.js";
import { generateSummary } from "../services/summarizer.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    cb(null, allowed.includes(file.mimetype));
  }
});

router.use(requireAuth);

router.get("/", async (req, res) => {
  const { q, subject, tag } = req.query;
  const filter = { userId: req.user.id };
  if (subject) filter.subjectId = subject;
  if (tag) filter.tags = tag;
  if (q) filter.$text = { $search: q };

  const notes = await Note.find(filter).populate("subjectId", "subjectName").sort("-createdAt");
  res.json({ notes });
});

router.post("/upload", upload.single("file"), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "Upload a JPG, PNG, JPEG, or PDF file" });
  }

  try {
    const { title, subjectName, tags = "" } = req.body;
    const subject = await Subject.findOneAndUpdate(
      { userId: req.user.id, subjectName },
      { userId: req.user.id, subjectName },
      { new: true, upsert: true }
    );
    const cloudFile = await uploadToCloudinary(req.file);
    const extractedText = await extractHandwriting(req.file);
    const aiSummary = await generateSummary(extractedText);

    const createdNote = await Note.create({
      userId: req.user.id,
      subjectId: subject._id,
      title,
      tags: tags.split(",").map((tagName) => tagName.trim()).filter(Boolean),
      fileUrl: cloudFile.secure_url,
      extractedText,
      aiSummary
    });
    const note = await Note.findById(createdNote._id).populate("subjectId", "subjectName");

    return res.status(201).json({ note });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { $inc: { viewCount: 1 } },
    { new: true }
  ).populate("subjectId", "subjectName");
  res.json({ note });
});

router.get("/:id/export/pdf", async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id }).populate("subjectId", "subjectName");
    if (!note) return res.status(404).json({ message: "Note not found" });
    return streamNotePdf(note, res);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const existing = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!existing) return res.status(404).json({ message: "Note not found" });

    const textChanged = req.body.extractedText && req.body.extractedText !== existing.extractedText;
    existing.title = req.body.title ?? existing.title;
    existing.extractedText = req.body.extractedText ?? existing.extractedText;
    existing.tags = req.body.tags ?? existing.tags;

    if (textChanged) {
      existing.aiSummary = await generateSummary(req.body.extractedText);
    }

    await existing.save();
    const note = await Note.findById(existing._id).populate("subjectId", "subjectName");
    return res.json({ note });
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/summary", async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    note.aiSummary = await generateSummary(note.extractedText);
    await note.save();
    const updatedNote = await Note.findById(note._id).populate("subjectId", "subjectName");
    return res.json({ note: updatedNote });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", async (req, res) => {
  await Note.deleteOne({ _id: req.params.id, userId: req.user.id });
  res.status(204).end();
});

export default router;

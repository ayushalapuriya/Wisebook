import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { Note } from "../models/Note.js";
import { Subject } from "../models/Subject.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const subjects = await Subject.find({ userId: req.user.id }).sort("subjectName");
  res.json({ subjects });
});

router.post("/", async (req, res) => {
  const subject = await Subject.create({ userId: req.user.id, subjectName: req.body.subjectName });
  res.status(201).json({ subject });
});

router.put("/:id", async (req, res) => {
  const subject = await Subject.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { subjectName: req.body.subjectName },
    { new: true }
  );
  res.json({ subject });
});

router.delete("/:id", async (req, res) => {
  const used = await Note.exists({ userId: req.user.id, subjectId: req.params.id });
  if (used) {
    return res.status(409).json({ message: "Move or delete notes before deleting this subject" });
  }
  await Subject.deleteOne({ _id: req.params.id, userId: req.user.id });
  res.status(204).end();
});

export default router;

import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { Note } from "../models/Note.js";
import { Subject } from "../models/Subject.js";

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const userId = req.user.id;
  const [totalNotes, totalSubjects, summariesGenerated, mostViewed, notesPerSubject] = await Promise.all([
    Note.countDocuments({ userId }),
    Subject.countDocuments({ userId }),
    Note.countDocuments({ userId, aiSummary: { $exists: true } }),
    Note.findOne({ userId }).sort("-viewCount").select("title viewCount"),
    Note.aggregate([
      { $match: { userId: Note.schema.path("userId").cast(userId) } },
      { $group: { _id: "$subjectId", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
  ]);

  res.json({
    totalNotes,
    totalSubjects,
    summariesGenerated,
    mostViewed,
    notesUploadedThisMonth: await Note.countDocuments({
      userId,
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    }),
    notesPerSubject
  });
});

export default router;

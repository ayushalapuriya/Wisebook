import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { Note } from '../models/Note.js';
import { generateStudySummary } from '../services/ai.service.js';
import { extractHandwritingText } from '../services/ocr.service.js';
import { uploadToCloudinary } from '../services/upload.service.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const { q, subjectId, tag } = req.query;
    const filter = { userId: req.user.id };

    if (subjectId) filter.subjectId = subjectId;
    if (tag) filter.tags = tag;
    if (q) filter.$text = { $search: q };

    const notes = await Note.find(filter).sort({ createdAt: -1 }).populate('subjectId');
    res.json({ notes });
  } catch (error) {
    next(error);
  }
});

router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    const fileUrl = req.file ? await uploadToCloudinary(req.file) : '';
    const extractedText = req.file ? await extractHandwritingText(req.file) : req.body.extractedText;
    res.json({ fileUrl, extractedText });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const note = await Note.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ note });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/summary', async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });

    if (!note) {
      const error = new Error('Note not found');
      error.status = 404;
      throw error;
    }

    note.aiSummary = await generateStudySummary(note.extractedText);
    await note.save();
    res.json({ summary: note.aiSummary });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Note.deleteOne({ _id: req.params.id, userId: req.user.id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

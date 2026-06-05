import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Subject } from '../models/Subject.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const subjects = await Subject.find({ userId: req.user.id }).sort({ subjectName: 1 });
    res.json({ subjects });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const subject = await Subject.create({ userId: req.user.id, subjectName: req.body.subjectName });
    res.status(201).json({ subject });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { subjectName: req.body.subjectName },
      { new: true }
    );
    res.json({ subject });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Subject.deleteOne({ _id: req.params.id, userId: req.user.id });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

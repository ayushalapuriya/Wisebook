import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { Note } from "../models/Note.js";
import { Subject } from "../models/Subject.js";
import { User } from "../models/User.js";
import { uploadToCloudinary } from "../services/cloudStorage.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    cb(null, allowed.includes(file.mimetype));
  }
});

function signUser(user) {
  return jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
}

router.post("/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password || password !== confirmPassword) {
    return res.status(400).json({ message: "Enter valid registration details" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) });
  const token = signUser(user);
  return res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = signUser(user);
  return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select("name email profileImage");
  return res.json({ user });
});

router.put("/me", requireAuth, upload.single("profileImage"), async (req, res, next) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const existing = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existing) {
      return res.status(409).json({ message: "Email already used by another account" });
    }

    const currentUser = await User.findById(req.user.id).select("profileImage");
    let profileImage = currentUser?.profileImage || "";
    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file, "wisebook/profiles");
      profileImage = uploaded.secure_url;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, profileImage },
      { new: true }
    ).select("name email profileImage");
    const token = signUser(user);
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, profileImage: user.profileImage } });
  } catch (error) {
    return next(error);
  }
});

router.put("/password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Enter valid password details" });
  }

  const user = await User.findById(req.user.id);
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
  return res.json({ message: "Password updated successfully" });
});

router.delete("/me", requireAuth, async (req, res) => {
  await Promise.all([
    Note.deleteMany({ userId: req.user.id }),
    Subject.deleteMany({ userId: req.user.id }),
    User.deleteOne({ _id: req.user.id })
  ]);
  return res.status(204).end();
});

export default router;

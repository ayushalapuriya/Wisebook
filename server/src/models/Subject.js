import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subjectName: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

subjectSchema.index({ userId: 1, subjectName: 1 }, { unique: true });

export const Subject = mongoose.model("Subject", subjectSchema);

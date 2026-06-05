import mongoose from "mongoose";

const aiSummarySchema = new mongoose.Schema(
  {
    shortSummary: String,
    detailedSummary: String,
    keyPoints: [String],
    importantDefinitions: [String],
    examRevisionNotes: [String],
    flashcards: [{ front: String, back: String }],
    vivaQuestions: [String]
  },
  { _id: false }
);

const noteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    title: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    fileUrl: { type: String, default: "" },
    extractedText: { type: String, default: "" },
    aiSummary: aiSummarySchema,
    quizzes: [{ question: String, options: [String], answer: String }],
    viewCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

noteSchema.index({ title: "text", tags: "text", extractedText: "text" });

export const Note = mongoose.model("Note", noteSchema);

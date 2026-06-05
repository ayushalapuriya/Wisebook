import PDFDocument from "pdfkit";

function writeList(doc, title, items = []) {
  if (!items.length) return;
  doc.moveDown(0.8).fontSize(14).fillColor("#152025").text(title, { underline: true });
  items.forEach((item) => {
    doc.fontSize(11).fillColor("#333333").text(`- ${item}`);
  });
}

export function streamNotePdf(note, res) {
  const doc = new PDFDocument({ margin: 48, size: "A4" });
  const summary = note.aiSummary || {};
  const subjectName = note.subjectId?.subjectName || "General";

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${note.title.replace(/[^a-z0-9_-]/gi, "_")}.pdf"`);

  doc.pipe(res);
  doc.fontSize(22).fillColor("#152025").text(note.title);
  doc.moveDown(0.3).fontSize(11).fillColor("#666666").text(`Subject: ${subjectName}`);
  doc.fontSize(11).text(`Uploaded: ${note.createdAt ? new Date(note.createdAt).toLocaleDateString() : "N/A"}`);
  if (note.tags?.length) doc.text(`Tags: ${note.tags.join(", ")}`);

  doc.moveDown(1).fontSize(16).fillColor("#152025").text("Extracted Text");
  doc.moveDown(0.3).fontSize(11).fillColor("#333333").text(note.extractedText || "No extracted text saved.", {
    align: "left"
  });

  doc.addPage();
  doc.fontSize(18).fillColor("#152025").text("AI Revision Kit");
  doc.moveDown(0.7).fontSize(14).text("Short Summary", { underline: true });
  doc.moveDown(0.2).fontSize(11).fillColor("#333333").text(summary.shortSummary || "Summary not generated.");

  writeList(doc, "Key Points", summary.keyPoints);
  writeList(doc, "Important Definitions", summary.importantDefinitions);
  writeList(doc, "Exam Revision Notes", summary.examRevisionNotes);
  writeList(doc, "Viva Questions", summary.vivaQuestions);

  if (summary.flashcards?.length) {
    doc.moveDown(0.8).fontSize(14).fillColor("#152025").text("Flashcards", { underline: true });
    summary.flashcards.forEach((card, index) => {
      doc.moveDown(0.2).fontSize(11).fillColor("#333333").text(`${index + 1}. ${card.front}`);
      doc.fontSize(11).fillColor("#666666").text(`   ${card.back}`);
    });
  }

  doc.end();
}

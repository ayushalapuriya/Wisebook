import Tesseract from "tesseract.js";
import { PDFParse } from "pdf-parse";

function fallbackOcrText(file, reason) {
  return [
    `OCR text could not be extracted from ${file.originalname}.`,
    reason,
    "WiseBook keeps this text editable so students can paste or correct note content before saving."
  ].join(" ");
}

export async function extractHandwriting(file) {
  if (file.mimetype === "application/pdf") {
    try {
      const parser = new PDFParse({ data: file.buffer });
      const result = await parser.getText();
      await parser.destroy();
      const text = result.text?.trim();
      return text || fallbackOcrText(file, "This PDF appears to be scanned/image-only. Convert the page to JPG or PNG and upload it for Tesseract OCR.");
    } catch (error) {
      return fallbackOcrText(file, `PDF text extraction failed: ${error.message}. Convert the page to JPG or PNG and upload it for OCR.`);
    }
  }

  try {
    const result = await Tesseract.recognize(file.buffer, "eng");
    const text = result.data?.text?.trim();
    return text || fallbackOcrText(file, "Tesseract did not find readable text in this image.");
  } catch (error) {
    return fallbackOcrText(file, `Tesseract OCR failed: ${error.message}`);
  }
}

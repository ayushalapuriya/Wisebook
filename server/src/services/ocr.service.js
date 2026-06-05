import { extractHandwriting } from "./ocr.js";

export async function extractHandwritingText(file) {
  return extractHandwriting(file);
}

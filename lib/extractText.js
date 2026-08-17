import mammoth from "mammoth";

/**
 * Extracts plain text from an uploaded resume file (PDF or DOCX).
 * @param {Buffer} buffer - raw file bytes
 * @param {string} mimeType - the file's mime type
 * @returns {Promise<string>} extracted, whitespace-normalized text
 */
export async function extractResumeText(buffer, mimeType) {
  let rawText = "";

  if (mimeType === "application/pdf") {
    // pdf-parse is CommonJS; require it lazily so Next.js bundles it correctly
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    rawText = data.text || "";
  } else if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    rawText = result.value || "";
  } else {
    throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
  }

  return normalizeWhitespace(rawText);
}

function normalizeWhitespace(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Basic quality check so we don't silently score near-empty extractions
 * (e.g. scanned, image-only PDFs with no text layer).
 */
export function isExtractionUsable(text) {
  const MIN_CHARS = 200;
  return typeof text === "string" && text.trim().length >= MIN_CHARS;
}

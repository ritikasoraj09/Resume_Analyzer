import { NextResponse } from "next/server";
import { extractResumeText, isExtractionUsable } from "../../../lib/extractText";
import { evaluateResume } from "../../../lib/ai";

export const runtime = "nodejs";
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume");

    if (!file) {
      return NextResponse.json({ error: "No resume file was uploaded." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let resumeText;
    try {
      resumeText = await extractResumeText(buffer, file.type);
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    if (!isExtractionUsable(resumeText)) {
      return NextResponse.json(
        {
          error:
            "Couldn't extract enough readable text from this file. It may be a scanned/image-only document. Please upload a text-based PDF or DOCX.",
        },
        { status: 422 }
      );
    }

    const evaluation = await evaluateResume(resumeText);
    return NextResponse.json(evaluation, { status: 200 });
  } catch (err) {
    console.error("analyze-resume error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong while analyzing the resume." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { generateInterviewQuestion } from "../../../lib/ai";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { company, difficulty } = await request.json();

    if (!company || typeof company !== "string" || !company.trim()) {
      return NextResponse.json({ error: "A target company is required." }, { status: 400 });
    }

    const allowedDifficulties = ["easy", "medium", "hard"];
    const normalizedDifficulty = (difficulty || "medium").toLowerCase();
    if (!allowedDifficulties.includes(normalizedDifficulty)) {
      return NextResponse.json(
        { error: "Difficulty must be one of easy, medium, hard." },
        { status: 400 }
      );
    }

    const result = await generateInterviewQuestion(company.trim(), normalizedDifficulty);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("generate-question error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong while generating the question." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { evaluateAnswer } from "../../../lib/ai";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { question, idealAnswer, candidateAnswer, keyPointsExpected } = await request.json();

    if (!question || !idealAnswer || !candidateAnswer) {
      return NextResponse.json(
        { error: "question, idealAnswer, and candidateAnswer are all required." },
        { status: 400 }
      );
    }

    if (!candidateAnswer.trim()) {
      return NextResponse.json(
        { error: "Your answer was empty. Please write a response before submitting." },
        { status: 400 }
      );
    }

    const result = await evaluateAnswer({
      question,
      idealAnswer,
      candidateAnswer,
      keyPointsExpected,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("evaluate-answer error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong while evaluating the answer." },
      { status: 500 }
    );
  }
}

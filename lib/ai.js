import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-6";

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to a .env.local file (see .env.example)."
    );
  }
  return new Anthropic({ apiKey });
}

/**
 * Calls the model and asks for a JSON-only response, then parses it.
 * Retries once with a stricter reminder if the first response isn't valid JSON.
 */
async function callForJSON(systemPrompt, userPrompt) {
  const client = getClient();

  const run = async (extraNote = "") => {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: systemPrompt + extraNote,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const raw = textBlock ? textBlock.text : "";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  };

  try {
    return await run();
  } catch (err) {
    // One retry with an explicit reminder in case the model added prose around the JSON
    return await run(
      "\n\nIMPORTANT: Respond with ONLY a single valid JSON object. No preamble, no markdown fences, no explanation."
    );
  }
}

/**
 * Evaluates resume text and returns a structured report.
 */
export async function evaluateResume(resumeText) {
  const systemPrompt = `You are an expert resume reviewer and career coach with years of experience helping candidates land interviews.
Evaluate the resume text you are given and respond with ONLY a JSON object matching exactly this shape:
{
  "score": <integer 0-100>,
  "strengths": [<string>, ...],
  "weaknesses": [<string>, ...],
  "suggestedJobFields": [<string>, ...],
  "improvementRecommendations": [<string>, ...],
  "summary": <string, 2-3 sentence overview>
}
Base the score on structure quality, content relevance, clarity, and keyword alignment with common industry expectations. Be specific and actionable, not generic.`;

  const userPrompt = `Evaluate the following resume:\n\n${resumeText}`;

  return callForJSON(systemPrompt, userPrompt);
}

/**
 * Generates a company-specific interview question at a given difficulty.
 */
export async function generateInterviewQuestion(company, difficulty) {
  const systemPrompt = `You are an experienced technical interviewer who writes realistic, role-relevant interview questions for a named company.
Respond with ONLY a JSON object matching exactly this shape:
{
  "question": <string>,
  "idealAnswer": <string, a strong model answer a top candidate might give>,
  "keyPointsExpected": [<string>, ...]
}
The question difficulty must be "${difficulty}". Tailor the question's theme and expectations to what is publicly known about ${company}'s focus areas, products, and culture, without inventing confidential information.`;

  const userPrompt = `Company: ${company}\nDifficulty: ${difficulty}\nGenerate one interview question with a model answer.`;

  return callForJSON(systemPrompt, userPrompt);
}

/**
 * Scores a candidate's typed answer against the ideal answer.
 */
export async function evaluateAnswer({ question, idealAnswer, candidateAnswer, keyPointsExpected }) {
  const systemPrompt = `You are an expert interview coach. Compare a candidate's answer to an ideal answer for the same question and respond with ONLY a JSON object matching exactly this shape:
{
  "matchPercentage": <integer 0-100>,
  "feedback": <string, specific and constructive>,
  "coveredPoints": [<string>, ...],
  "missedPoints": [<string>, ...]
}
Judge the candidate's answer on meaning and substance, not surface wording overlap. Consider whether the key points expected were addressed.`;

  const userPrompt = `Question: ${question}\n\nKey points expected: ${(keyPointsExpected || []).join("; ")}\n\nIdeal answer: ${idealAnswer}\n\nCandidate's answer: ${candidateAnswer}`;

  return callForJSON(systemPrompt, userPrompt);
}

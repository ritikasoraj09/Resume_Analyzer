"use client";

import { useEffect, useRef, useState } from "react";

const DIFFICULTIES = ["easy", "medium", "hard"];
const TIME_LIMIT_SECONDS = 180;

export default function InterviewPage() {
  const [stage, setStage] = useState("setup"); // setup -> answering -> result
  const [company, setCompany] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(TIME_LIMIT_SECONDS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (stage !== "answering") return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitAnswer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  async function handleGenerateQuestion(e) {
    e.preventDefault();
    setError("");
    if (!company.trim()) {
      setError("Please enter a target company.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, difficulty }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't generate a question. Try again.");
        setIsLoading(false);
        return;
      }
      setQuestion(data);
      setAnswer("");
      setSecondsLeft(TIME_LIMIT_SECONDS);
      setStage("answering");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmitAnswer() {
    clearInterval(timerRef.current);
    if (!answer.trim()) {
      setError("Write an answer before submitting (or let the timer run out).");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.question,
          idealAnswer: question.idealAnswer,
          candidateAnswer: answer,
          keyPointsExpected: question.keyPointsExpected,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't evaluate the answer. Try again.");
        setIsLoading(false);
        return;
      }
      setResult(data);
      setStage("result");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function resetAll() {
    setStage("setup");
    setQuestion(null);
    setAnswer("");
    setResult(null);
    setError("");
  }

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {stage === "setup" && (
        <form onSubmit={handleGenerateQuestion} className="card space-y-4">
          <h1 className="text-xl font-bold">Set up your mock interview</h1>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Target company</span>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google, a fintech startup, a defence R&D lab..."
              className="input-field"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Difficulty</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="input-field"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          </label>
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? "Generating question..." : "Start mock interview"}
          </button>
        </form>
      )}

      {stage === "answering" && question && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Interview Question</h2>
            <span
              className={`rounded-full px-3 py-1 text-sm font-mono font-semibold ${
                secondsLeft < 30 ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"
              }`}
            >
              {minutes}:{seconds}
            </span>
          </div>
          <p className="text-slate-800">{question.question}</p>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={8}
            placeholder="Type your answer here..."
            className="input-field"
          />
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button
            onClick={handleSubmitAnswer}
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? "Evaluating your answer..." : "Submit answer"}
          </button>
        </div>
      )}

      {stage === "result" && result && (
        <div className="space-y-4">
          <div className="card flex flex-col items-center gap-2 text-center">
            <span className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Match Score
            </span>
            <span className="text-5xl font-extrabold text-brand-600">
              {result.matchPercentage}%
            </span>
          </div>
          <div className="card">
            <h3 className="mb-2 font-semibold">Feedback</h3>
            <p className="text-sm text-slate-600">{result.feedback}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card">
              <h3 className="mb-2 font-semibold text-emerald-700">Covered Points</h3>
              <ul className="space-y-1 text-sm text-slate-600">
                {(result.coveredPoints || []).map((p, i) => (
                  <li key={i}>&bull; {p}</li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h3 className="mb-2 font-semibold text-rose-700">Missed Points</h3>
              <ul className="space-y-1 text-sm text-slate-600">
                {(result.missedPoints || []).map((p, i) => (
                  <li key={i}>&bull; {p}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="card">
            <h3 className="mb-2 font-semibold">Model Answer</h3>
            <p className="text-sm text-slate-600">{question.idealAnswer}</p>
          </div>
          <button onClick={resetAll} className="btn-secondary w-full">
            Practice another question
          </button>
        </div>
      )}
    </div>
  );
}

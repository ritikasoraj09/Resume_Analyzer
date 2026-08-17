"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please choose a PDF or DOCX resume first.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Unsupported file type. Please upload a PDF or DOCX file.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setIsSubmitting(false);
        return;
      }

      sessionStorage.setItem("resumeEvaluation", JSON.stringify(data));
      router.push("/results");
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Get instant AI feedback on your resume
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Upload your resume as a PDF or DOCX file. Our AI evaluator returns a
          score, strengths, weaknesses, and suggested career fields in seconds.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="card mx-auto max-w-lg space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Resume file (PDF or DOCX, max 5MB)
          </span>
          <input
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="input-field file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700"
          />
        </label>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Analyzing your resume..." : "Analyze my resume"}
        </button>
      </form>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <h3 className="font-semibold">1. Upload</h3>
          <p className="mt-1 text-sm text-slate-600">
            Drop in your PDF or DOCX resume. Text is extracted and normalized automatically.
          </p>
        </div>
        <div className="card">
          <h3 className="font-semibold">2. Get scored</h3>
          <p className="mt-1 text-sm text-slate-600">
            An AI model evaluates structure, clarity, and relevance, returning a score out of 100.
          </p>
        </div>
        <div className="card">
          <h3 className="font-semibold">3. Practice interviews</h3>
          <p className="mt-1 text-sm text-slate-600">
            Pick a company and difficulty, then get a timed mock interview with instant scoring.
          </p>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

export default function ResultsPage() {
  const [evaluation, setEvaluation] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("resumeEvaluation");
    if (stored) {
      setEvaluation(JSON.parse(stored));
    } else {
      setNotFound(true);
    }
  }, []);

  if (notFound) {
    return (
      <div className="card mx-auto max-w-lg text-center">
        <p className="text-slate-600">
          No resume evaluation found yet.
        </p>
        <a href="/" className="btn-primary mt-4 inline-flex">
          Upload a resume
        </a>
      </div>
    );
  }

  if (!evaluation) {
    return <p className="text-center text-slate-500">Loading...</p>;
  }

  const { score, strengths, weaknesses, suggestedJobFields, improvementRecommendations, summary } =
    evaluation;

  return (
    <div className="space-y-6">
      <div className="card flex flex-col items-center gap-2 text-center">
        <span className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Overall Resume Score
        </span>
        <span className="text-5xl font-extrabold text-brand-600">{score}/100</span>
        {summary && <p className="mt-2 max-w-xl text-slate-600">{summary}</p>}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <ListCard title="Strengths" items={strengths} tone="positive" />
        <ListCard title="Weaknesses" items={weaknesses} tone="negative" />
        <ListCard title="Suggested Job Fields" items={suggestedJobFields} tone="neutral" />
        <ListCard
          title="Improvement Recommendations"
          items={improvementRecommendations}
          tone="neutral"
        />
      </div>

      <div className="text-center">
        <a href="/interview" className="btn-primary">
          Practice a mock interview &rarr;
        </a>
      </div>
    </div>
  );
}

function ListCard({ title, items, tone }) {
  const dotColor =
    tone === "positive" ? "bg-emerald-500" : tone === "negative" ? "bg-rose-500" : "bg-brand-500";

  return (
    <div className="card">
      <h3 className="mb-3 font-semibold">{title}</h3>
      {items && items.length > 0 ? (
        <ul className="space-y-2 text-sm text-slate-600">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${dotColor}`} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-400">None reported.</p>
      )}
    </div>
  );
}

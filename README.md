# Resume Analyzer & Interview Prep Tool

A full-stack AI web app that evaluates resumes and runs company-specific,
timed mock interviews — built with Next.js (App Router), Tailwind CSS, and
the Claude API. This is a working implementation of the system described in
the accompanying internship report ("Resume Analyzer and Interview Prep
Tool", ISSA / DRDO).

## Features

- **Resume upload & scoring** — upload a PDF or DOCX resume; the app extracts
  the text, sends it to an AI model, and returns a score out of 100 with
  strengths, weaknesses, suggested job fields, and improvement tips.
- **Company-specific mock interviews** — pick a target company and a
  difficulty (easy / medium / hard) to get an AI-generated interview
  question with a model answer.
- **Timed answers with scoring** — a 3-minute timer, then your typed answer
  is compared against the model answer for a percentage match score and
  detailed feedback.
- **Validation** — rejects oversized files, unsupported formats, and
  scanned/image-only documents that yield too little extractable text.

## Tech stack

| Layer     | Technology                                   |
|-----------|-----------------------------------------------|
| Frontend  | Next.js (App Router) + React + Tailwind CSS   |
| Backend   | Next.js API routes (Node.js runtime)          |
| AI        | Claude API (`@anthropic-ai/sdk`)              |
| Parsing   | `pdf-parse` (PDF), `mammoth` (DOCX)           |
| Hosting   | Vercel (recommended)                          |

## Project structure

```
resume-analyzer/
├─ app/
│  ├─ page.js                     # Upload / home page
│  ├─ results/page.js             # Resume evaluation results
│  ├─ interview/page.js           # Mock interview flow (setup → timed answer → score)
│  ├─ layout.js, globals.css
│  └─ api/
│     ├─ analyze-resume/route.js      # POST: file → extracted text → AI evaluation
│     ├─ generate-question/route.js   # POST: {company, difficulty} → question + ideal answer
│     └─ evaluate-answer/route.js     # POST: {question, idealAnswer, candidateAnswer} → score
├─ lib/
│  ├─ extractText.js              # PDF/DOCX text extraction + quality checks
│  └─ ai.js                       # Claude API calls + structured JSON prompts
├─ package.json
└─ .env.example
```

## Getting started locally

**Requirements:** Node.js 18.17+ and an Anthropic API key.

```bash
git clone <your-repo-url>
cd resume-analyzer
npm install
cp .env.example .env.local
```

Edit `.env.local` and add your key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Get a key from [console.anthropic.com](https://console.anthropic.com/).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. Push this repository to GitHub (see below).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Under **Environment Variables**, add `ANTHROPIC_API_KEY` with your key.
4. Deploy. Every subsequent push to the main branch redeploys automatically.

## How it works

1. **Resume analysis** — `POST /api/analyze-resume` receives a multipart file
   upload, extracts and normalizes the text (`lib/extractText.js`), and sends
   it to Claude with a prompt that requests a structured JSON response
   (`lib/ai.js`). The API route validates file type/size and rejects
   extractions that are too short to be a real resume.
2. **Question generation** — `POST /api/generate-question` sends the chosen
   company and difficulty to Claude, asking for a question, an ideal answer,
   and the key points a strong answer should cover.
3. **Answer evaluation** — `POST /api/evaluate-answer` sends the question,
   ideal answer, and the candidate's typed answer to Claude, which returns a
   percentage match score, qualitative feedback, and which key points were
   covered or missed.

All three routes ask the model for JSON-only output so the frontend can
render structured cards instead of parsing free text.

## Notes & limitations

- AI-generated scores are probabilistic and should be treated as guidance,
  not an absolute measure of employability.
- Complex resume layouts, scanned PDFs, and image-only documents may reduce
  text-extraction quality.
- The interview module is currently text-based only (no voice/video).

## License

MIT — use this freely for learning, coursework, or as a starting point for
your own project.

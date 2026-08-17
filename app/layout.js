import "./globals.css";

export const metadata = {
  title: "Resume Analyzer & Interview Prep",
  description:
    "AI-powered resume evaluation and company-specific mock interview practice.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <header className="mb-8 flex items-center justify-between">
            <a href="/" className="text-lg font-bold text-brand-700">
              Resume Analyzer <span className="text-slate-400">&amp;</span> Interview Prep
            </a>
            <nav className="flex gap-4 text-sm font-medium text-slate-600">
              <a href="/" className="hover:text-brand-600">Analyze</a>
              <a href="/interview" className="hover:text-brand-600">Mock Interview</a>
            </nav>
          </header>
          <main>{children}</main>
          <footer className="mt-16 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
            Built with Next.js &middot; AI evaluation powered by Claude
          </footer>
        </div>
      </body>
    </html>
  );
}

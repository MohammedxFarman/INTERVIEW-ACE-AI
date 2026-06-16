/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Resume } from "../types";
import { 
  FileText, 
  Upload, 
  Sparkles, 
  CheckCircle, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  ChevronRight, 
  Clock,
  ArrowLeft,
  Loader2,
  Trash2,
  AlertCircle,
  ShieldCheck,
  Award
} from "lucide-react";
import { motion } from "motion/react";

interface ResumeAnalyzerProps {
  setCurrentPage: (page: string) => void;
  selectedResume: Resume | null;
  setSelectedResume: (resume: Resume | null) => void;
}

const SAMPLE_RESUME_TEXT = `Alex Mercer
alex.mercer@email.com | (555) 019-2834 | Seattle, WA | github.com/alexmercer

CORE SUMMARY:
Enthusiastic and results-driven Frontend Developer with 3+ years of experience specializing in building highly modular, scalable React applications with modern TypeScript, state management systems, and custom Tailwind styling. Proven record of accelerating system load times by 40% and coordinating with cross-functional designer modules.

TECHNICAL SKILLS:
Languages: JavaScript (ES6+), HTML5, CSS3, TypeScript
Frameworks & Libraries: React, Next.js, Redux Toolkit, Context API, Node.js, Express, Jest
Developer Tools: Webpack, Vite, Git, GitHub Actions, Docker, AWS (S3, CloudFront)

PROFESSIONAL EXPERIENCE:
Software Engineer (Frontend Focus)
Novus Tech Systems | Seattle, WA
Jan 2024 - Present
- Architected and delivered 12+ single-page interfaces using React and Tailwind CSS, increasing user session activity by 22%.
- Integrated state telemetry and Context hooks to manage cache loads, resolving memory leaks in enterprise models.
- Refactored build targets using Vite, which accelerated dev starts by 300% and reduced final bundle volumes by 45%.
- Coordinated code reviews, championing unit testing structures in Jest, leading to 90% overall test coverage.

Junior Software Engineer
PixelCraft Labs | Bellevue, WA
Sep 2022 - Dec 2023
- Built dynamic visual charts using D3 and Recharts, improving data comprehensibility for 5,000+ business operators.
- Implemented accessible keyboard-friendly modal drawers (compliant with WCAG AA ratings).
- Managed local SQLite schemas for client preferences caching, ensuring rapid offline-first dashboard load speeds.

EDUCATION:
Bachelor of Science in Computer Science
University of Washington, Seattle, WA | Graduated May 2022`;

export const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({ 
  setCurrentPage, 
  selectedResume,
  setSelectedResume
}) => {
  const [resumeText, setResumeText] = useState("");
  const [filename, setFilename] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Resume[]>([]);
  const [activeReport, setActiveReport] = useState<Resume | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  // Real-time ATS Score calculation based on current textarea input
  const realTimeATSScore = (() => {
    const text = resumeText || "";
    if (text.trim().length === 0) return 0;
    
    let score = 25; // base score for having any text
    
    // 1. Check sections (up to 20 points)
    const sections = ["experience", "education", "skills", "summary", "project", "work", "contact"];
    let sectionPoints = 0;
    sections.forEach(sec => {
      if (text.toLowerCase().includes(sec)) sectionPoints += 4;
    });
    score += Math.min(20, sectionPoints);
    
    // 2. Check technical keywords (up to 30 points)
    const keywords = [
      "react", "typescript", "javascript", "tailwind", "node", "express", "redux", "git", 
      "vite", "jest", "docker", "aws", "sql", "python", "d3", "recharts", "apis", "graphql",
      "next.js"
    ];
    let keywordCount = 0;
    keywords.forEach(kw => {
      if (text.toLowerCase().includes(kw)) {
        keywordCount++;
      }
    });
    score += Math.min(30, keywordCount * 3.5);
    
    // 3. Contact Details / Links (up to 15 points)
    if (text.toLowerCase().includes("@")) score += 5; // email
    if (/\b\d{3}[-.)\s]?\d{3}[-.)\s]?\d{4}\b/.test(text)) score += 5; // phone number
    if (text.toLowerCase().includes("github.com") || text.toLowerCase().includes("linkedin.com") || text.toLowerCase().includes("portfolio")) score += 5;
    
    // 4. Quantifiable achievements / metrics (up to 15 points)
    const metricsCount = (text.match(/\b\d+%\b|\b\d+\+\b|\b\d+\s+(years|months|projects|users|leads|load|speed|times|starts)\b/gi) || []).length;
    score += Math.min(15, metricsCount * 3);
    
    // 5. Length evaluation (up to 20 points)
    const length = text.trim().split(/\s+/).length;
    if (length > 250) score += 20;
    else if (length > 120) score += 12;
    else if (length > 40) score += 6;
    
    return Math.min(100, Math.round(score));
  })();

  const getRealTimeTips = () => {
    const text = resumeText || "";
    const tips = [];
    
    if (text.trim().length === 0) {
      return ["Provide copy-pasted or uploaded resume text to initiate real-time ATS scoring guidelines!"];
    }
    
    const sections = ["experience", "education", "skills"];
    const missingSections = sections.filter(sec => !text.toLowerCase().includes(sec));
    if (missingSections.length > 0) {
      tips.push(`Add header(s): ${missingSections.map(s => s.toUpperCase()).join(", ")}`);
    }
    
    const keywords = ["react", "typescript", "javascript", "tailwind", "node", "git", "aws", "sql"];
    const matchedCount = keywords.filter(kw => text.toLowerCase().includes(kw)).length;
    if (matchedCount < 4) {
      tips.push("Add essential tech keywords (e.g. React, TypeScript, Git)");
    }
    
    if (!text.toLowerCase().includes("@")) {
      tips.push("Include a valid contact email address");
    }
    
    const hasPhone = /\b\d{3}[-.)\s]?\d{3}[-.)\s]?\d{4}\b/.test(text);
    if (!hasPhone) {
      tips.push("Provide a contact phone number");
    }
    
    const metricsCount = (text.match(/\b\d+%\b|\b\d+\+\b|\b\d+\s+(years|months|projects|users|leads|load|speed|times|starts)\b/gi) || []).length;
    if (metricsCount < 2) {
      tips.push("Add quantifiable metrics (e.g., 'saved 40% loading time')");
    }
    
    const wordsCount = text.trim().split(/\s+/).length;
    if (wordsCount < 180) {
      tips.push(`Aim for at least 180 words (current count is ${wordsCount})`);
    }
    
    if (tips.length === 0) {
      tips.push("✨ Exceptional match! Ready to submit scorecard run.");
    }
    
    return tips.slice(0, 3); // show top 3 suggestions
  };

  useEffect(() => {
    // If a resume was selected from the dashboard, load it immediately
    if (selectedResume) {
      setActiveReport(selectedResume);
    }
    loadHistory();
  }, [selectedResume]);

  const loadHistory = async () => {
    try {
      const data = await api.resumes.getHistory();
      setHistory(data);
    } catch (err: any) {
      console.error("Error loading resume history:", err);
    }
  };

  const preloadSample = () => {
    setResumeText(SAMPLE_RESUME_TEXT);
    setFilename("Alex_Mercer_Resume_2026.pdf");
    setError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFilename(file.name);
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setResumeText(event.target?.result as string || "");
        };
        reader.readAsText(file);
      } else {
        // For PDF/Word, we can simulate extracting the text or prompt the user
        // We'll pre-fill or instruct them to paste contents
        setResumeText(`[Extracted from filename: ${file.name}]\n\nCandidate Profile: Software Engineer\nDetails: File uploaded. Please write some description here or use the prefilled sample for validation. App parses plaintext contents securely.`);
      }
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      setError("Please paste your resume text or load our high-quality sample text first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const name = filename || "Uploaded_Candidate_Resume.txt";
      const report = await api.resumes.analyze(name, resumeText);
      setActiveReport(report);
      // Reset checklist states for the new report
      setChecklist({});
      loadHistory();
    } catch (err: any) {
      setError(err?.message || "Failed to analyze the resume contents. Please verify API configurations.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleChecklist = (item: string) => {
    setChecklist(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const handleClearActiveReport = () => {
    setActiveReport(null);
    setSelectedResume(null);
    setResumeText("");
    setFilename("");
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)] px-6 py-8 md:py-12" id="resume-analyzer-container">
      <div className="max-w-7xl mx-auto">
        
        {/* Banner header */}
        <div className="flex items-center space-x-3 mb-10">
          <FileText className="h-8 w-8 text-indigo-400" />
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Resume Scorecard</h1>
            <p className="text-slate-400 text-sm mt-0.5">Validate your ATS keyword matching and discover quality improvement vectors.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-900/30 text-red-200 text-xs p-4 rounded-xl flex items-center space-x-2.5 mb-8" id="resume-error">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50" id="resume-loading">
            <div className="text-center bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-sm shadow-2xl">
              <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto mb-4" />
              <h3 className="text-md font-bold text-white mb-2">Analyzing Resume</h3>
              <p className="text-xs text-slate-400 leading-normal">Gemini 3.5 is parsing coordinates, executing ATS keyword validations, and identifying structural weaknesses. This should take about 5 seconds.</p>
            </div>
          </div>
        )}

        {/* Split View layouts OR active report display */}
        {activeReport ? (
          /* DISPLAY COMPLETED REPORT PAGE */
          <div className="space-y-8" id="resume-report">
            {/* Report Back actions block */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-6 mb-4">
              <button
                id="btn-report-back"
                onClick={handleClearActiveReport}
                className="flex items-center space-x-1.5 text-slate-400 hover:text-slate-200 text-xs group cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" />
                <span>Upload New Resume</span>
              </button>

              <div className="text-xs text-slate-500 flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                <span>Evaluated on {new Date(activeReport.uploadDate).toLocaleString()}</span>
              </div>
            </div>

            {/* Score panel dials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl md:col-span-2 flex flex-col md:flex-row items-center justify-around gap-6 text-center md:text-left">
                <div className="space-y-2">
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-900/30 px-2.5 py-1 rounded-full font-bold">RECRUITER RATING CARD</span>
                  <h2 className="text-2xl font-black text-white">{activeReport.filename}</h2>
                  <p className="text-xs text-slate-400 max-w-sm leading-normal">
                    This automated resume review detects spacing anomalies, missing technical skills keyword matrices, and assesses overall lexical density.
                  </p>
                </div>

                <div className="flex space-x-8">
                  {/* Gauge 1 */}
                  <div className="relative flex flex-col items-center">
                    <div className="h-24 w-24 flex items-center justify-center relative bg-slate-950/40 rounded-full shadow-inner border border-slate-850">
                      <svg className="w-full h-full transform -rotate-90 absolute">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="7"
                          fill="transparent"
                          className="text-slate-800/80"
                        />
                        <motion.circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="7"
                          fill="transparent"
                          className="text-indigo-500"
                          strokeDasharray={251.3}
                          initial={{ strokeDashoffset: 251.3 }}
                          animate={{ strokeDashoffset: 251.3 - (251.3 * activeReport.resumeScore) / 100 }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="text-xl font-black text-indigo-400 font-mono z-10">{activeReport.resumeScore}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-2.5">Resume Score</span>
                  </div>

                  {/* Gauge 2 */}
                  <div className="relative flex flex-col items-center">
                    <div className="h-24 w-24 flex items-center justify-center relative bg-slate-950/40 rounded-full shadow-inner border border-slate-850">
                      <svg className="w-full h-full transform -rotate-90 absolute">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="7"
                          fill="transparent"
                          className="text-slate-800/80"
                        />
                        <motion.circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="7"
                          fill="transparent"
                          className="text-emerald-500"
                          strokeDasharray={251.3}
                          initial={{ strokeDashoffset: 251.3 }}
                          animate={{ strokeDashoffset: 251.3 - (251.3 * activeReport.atsScore) / 100 }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="text-xl font-black text-emerald-400 font-mono z-10">{activeReport.atsScore}%</span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-2.5">ATS Score</span>
                  </div>
                </div>
              </div>

              {/* Skills Card */}
              <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl">
                <div className="flex items-center space-x-1.5 text-amber-400 mb-4">
                  <Flame className="h-5 w-5" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Missing Core Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeReport.missingSkills.map((sk, idx) => (
                    <span 
                      key={idx} 
                      className="text-xs bg-slate-950/60 border border-slate-850 px-3 py-1.5 rounded-lg text-slate-300 font-semibold"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Strengths & Weaknesses double blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl">
                <h3 className="text-md font-bold text-white mb-4 flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <span>Key Recruiter Strengths</span>
                </h3>
                <div className="space-y-3">
                  {activeReport.strengths.map((str, idx) => (
                    <div key={idx} className="flex items-start space-x-3 text-xs bg-slate-900/40 p-3.5 rounded-lg border border-slate-850/60 text-slate-300 leading-normal">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl">
                <h3 className="text-md font-bold text-white mb-4 flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <span>Identified Deficiencies</span>
                </h3>
                <div className="space-y-3">
                  {activeReport.weaknesses.map((wk, idx) => (
                    <div key={idx} className="flex items-start space-x-3 text-xs bg-slate-900/40 p-3.5 rounded-lg border border-slate-850/60 text-slate-300 leading-normal">
                      <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{wk}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Checklist items suggested actions card */}
            <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl">
              <h3 className="text-md font-bold text-white mb-4">Recommended Action Checklist</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Click on the targets to register completions. Build an iterative feedback loops by applying these changes and uploading again.
              </p>

              <div className="space-y-3">
                {activeReport.suggestedImprovements.map((imp, idx) => {
                  const isChecked = !!checklist[imp];
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleChecklist(imp)}
                      className={`flex items-start space-x-3.5 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked 
                          ? "bg-slate-950/40 border-slate-850 opacity-55 saturate-50" 
                          : "bg-slate-950 border-slate-850/80 hover:border-indigo-900/30"
                      }`}
                    >
                      <div className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isChecked ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-700"
                      }`}>
                        {isChecked && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                      <span className={`text-xs ${isChecked ? "line-through text-slate-500" : "text-slate-300"}`}>
                        {imp}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          /* FORM UPLOAD VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="resume-upload-form">
            
            {/* Input form - Left 2 Columns */}
            <form onSubmit={handleAnalyze} className="lg:col-span-2 bg-slate-900 border border-slate-800/80 p-8 rounded-2xl space-y-6 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Candidate Input Panel</span>
                <button
                  type="button"
                  onClick={preloadSample}
                  className="text-xs text-indigo-400 font-bold hover:underline cursor-pointer flex items-center space-x-1"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Preload Sample Resume</span>
                </button>
              </div>

              {/* Paste details Area */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">Copy-Paste Resume Content (Plain Text)</label>
                <textarea
                  id="textarea-resume-content"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste complete copy of your details (Contact, Skills, Education, Professional Projects, etc.) here to execute multi-node matches."
                  className="w-full h-80 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors leading-relaxed font-mono resize-none"
                  required
                />
              </div>

              {/* File drag attachment simulator */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">Or Attach Document (Simulated upload)</label>
                <div className="border border-dashed border-slate-800 bg-slate-950 hover:bg-slate-950/80 rounded-xl p-5 text-center relative group cursor-pointer transition-colors">
                  <input
                    id="input-resume-file"
                    type="file"
                    onChange={handleFileUpload}
                    accept=".txt,.pdf,.docx"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-1.5">
                    <Upload className="h-6 w-6 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    <span className="text-[11px] text-slate-400 group-hover:text-slate-300 font-semibold transition-colors">
                      {filename ? `Selected: ${filename}` : "Upload .txt, .pdf, or .docx file"}
                    </span>
                    <span className="text-[10px] text-slate-600">Max size 10MB</span>
                  </div>
                </div>
              </div>

              <button
                id="btn-resume-submit"
                type="submit"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-md"
              >
                <Sparkles className="h-4.5 w-4.5" />
                <span className="text-sm">Initiate Scoring Report</span>
              </button>
            </form>

             {/* Sidebar history - Right 1 Column */}
            <div className="space-y-6">
              
              {/* Real-time ATS Score Gauge Card */}
              <div className="bg-slate-900 border border-indigo-950 rounded-2xl p-6 shadow-md relative overflow-hidden" id="realtime-ats-gauge-card">
                {/* Background glow when score is high */}
                <div className={`absolute -right-12 -top-12 w-28 h-28 rounded-full blur-2xl transition-colors duration-500 pointer-events-none ${
                  realTimeATSScore >= 75 ? "bg-emerald-500/10" :
                  realTimeATSScore >= 45 ? "bg-amber-500/5" :
                  "bg-indigo-500/5"
                }`} />

                <div className="flex items-center space-x-2 mb-5">
                  <ShieldCheck className="h-4.5 w-4.5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">ATS Strength Shield</h3>
                </div>

                <div className="flex flex-col items-center justify-center p-3 bg-slate-950/60 rounded-xl border border-slate-850/60 relative mb-5">
                  {/* Circular visual gauge/progress circle */}
                  <div className="relative h-28 w-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90 absolute">
                      <circle
                        cx="56"
                        cy="56"
                        r="46"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-800/80"
                      />
                      {/* Dynamic animated stroke offset */}
                      <motion.circle
                        cx="56"
                        cy="56"
                        r="46"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className={
                          realTimeATSScore >= 75 ? "text-emerald-500" :
                          realTimeATSScore >= 45 ? "text-amber-500" :
                          "text-indigo-450"
                        }
                        strokeDasharray={289}
                        initial={{ strokeDashoffset: 289 }}
                        animate={{ strokeDashoffset: 289 - (289 * realTimeATSScore) / 100 }}
                        transition={{ type: "spring", damping: 15 }}
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    <div className="text-center z-10 flex flex-col justify-center">
                      <span className="text-2xl font-black text-white font-mono tracking-tight leading-none">
                        {realTimeATSScore}%
                      </span>
                      <span className="text-[9px] text-slate-500 uppercase font-black font-mono tracking-wider mt-0.5">
                        Match Score
                      </span>
                    </div>
                  </div>

                  {/* Real-time description label */}
                  <div className="mt-3.5 text-center">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      realTimeATSScore >= 75 ? "bg-emerald-950 text-emerald-400 border-emerald-900/40" :
                      realTimeATSScore >= 45 ? "bg-amber-950 text-amber-500 border-amber-900/30" :
                      realTimeATSScore > 0 ? "bg-red-950 text-red-500 border-red-900/30" :
                      "bg-slate-900 text-slate-500 border-slate-800"
                    }`}>
                      {realTimeATSScore >= 75 ? "EXCEPTIONAL ACCLAIM 🎖️" :
                       realTimeATSScore >= 45 ? "GOOD ALIGNMENT ⚡" :
                       realTimeATSScore > 0 ? "CRITICAL GAPS ⚠️" :
                       "EMPTY INPUT"}
                    </span>
                  </div>
                </div>

                {/* Micro guidelines matching advice */}
                <div className="space-y-3.5">
                  <div className="border-b border-slate-850 pb-2">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase block tracking-wider">ATS MATCHING RECOMMENDATIONS</span>
                  </div>
                  
                  <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                    {getRealTimeTips().map((tip, tIdx) => (
                      <div key={tIdx} className={`text-[11px] p-2 rounded-lg leading-normal flex items-start space-x-2 border ${
                        realTimeATSScore >= 75 ? "bg-emerald-950/20 border-emerald-900/10 text-slate-300" :
                        "bg-slate-950 border-slate-850/80 text-slate-400"
                      }`}>
                        <div className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${
                          realTimeATSScore >= 75 ? "bg-emerald-500" :
                          realTimeATSScore >= 45 ? "bg-amber-500" :
                          "bg-indigo-400"
                        }`} />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[9.5px] text-slate-500 leading-normal text-center italic mt-1">
                    *Score updates dynamically as you type or adjust keywords inside the candidate input panel.
                  </p>
                </div>
              </div>

               <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-md">
                <div className="flex items-center space-x-2 mb-6">
                  <Clock className="h-4.5 w-4.5 text-indigo-400" />
                  <h3 className="text-md font-bold text-white">Evaluation History</h3>
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-xs text-slate-500">History is currently blank.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1" id="resume-history-list">
                    {history.map((hItem) => (
                      <div
                        id={`resume-item-${hItem.id}`}
                        key={hItem.id}
                        onClick={() => setActiveReport(hItem)}
                        className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-850 hover:border-indigo-950/40 rounded-xl cursor-pointer group transition-all"
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <FileText className="h-4.5 w-4.5 text-slate-500 group-hover:text-indigo-400 shrink-0 transition-colors" />
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-300 block truncate group-hover:text-white">{hItem.filename}</span>
                            <span className="text-[10px] text-slate-500 block">{new Date(hItem.uploadDate).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0">
                          <span className="text-xs font-bold text-indigo-400">{hItem.resumeScore}/100</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

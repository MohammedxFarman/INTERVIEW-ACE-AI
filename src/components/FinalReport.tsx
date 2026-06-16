/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { InterviewSession, Question } from "../types";
import { 
  Award, 
  Map, 
  CheckCircle, 
  AlertTriangle, 
  ArrowLeft, 
  Loader2, 
  LineChart, 
  HelpCircle,
  HelpCircle as QuestionIcon,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { motion } from "motion/react";

interface FinalReportProps {
  setCurrentPage: (page: string) => void;
  selectedSessionId: string;
  setSelectedSessionId: (id: string) => void;
}

export const FinalReport: React.FC<FinalReportProps> = ({ 
  setCurrentPage, 
  selectedSessionId,
  setSelectedSessionId
}) => {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuestionsHistory, setShowQuestionsHistory] = useState(false);

  useEffect(() => {
    if (selectedSessionId) {
      loadReportDetails(selectedSessionId);
    }
  }, [selectedSessionId]);

  const loadReportDetails = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.interviews.getSessionDetails(id);
      setSession(data.session);
      setQuestions(data.questions);
    } catch (err: any) {
      setError(err?.message || "Failed to load finalized aggregate scorecard parameters.");
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToDashboard = () => {
    setSelectedSessionId("");
    setCurrentPage("dashboard");
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)] px-6 py-8 md:py-12" id="final-report-container">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation back */}
        <button
          id="btn-report-back-dashboard"
          onClick={handleReturnToDashboard}
          className="flex items-center space-x-1.5 text-slate-400 hover:text-slate-200 text-xs mb-8 group cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Candidate Hub</span>
        </button>

        {error && (
          <div className="bg-red-950/40 border border-red-900/30 text-red-200 text-xs p-4 rounded-xl flex items-center space-x-2.5 mb-8" id="report-error">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24" id="report-details-loading">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
            <span className="text-xs text-slate-400 ml-3 font-semibold">Resolving scorecard details...</span>
          </div>
        ) : !session ? (
          <div className="border border-dashed border-slate-800 rounded-2xl p-10 text-center" id="report-state-empty">
            <p className="text-sm text-slate-500">Record not found or not finalized.</p>
            <button onClick={handleReturnToDashboard} className="text-xs text-indigo-400 font-bold mt-2 hover:underline">
              Exit to dashboard Setup
            </button>
          </div>
        ) : (
          /* MAIN COMPOSITE CARD LAYOUT */
          <div className="space-y-8" id="report-view-root">
            
            {/* Session Headline Info */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-900/40 px-2.5 py-1 rounded-full font-bold uppercase tracking-widest leading-none">
                  AI REPORT CARD
                </span>
                <h2 className="text-2xl font-extrabold text-white">{session.role} Assessment</h2>
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-1.5 text-xs text-slate-400">
                  <span className="bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-indigo-300 font-medium">{session.difficulty}</span>
                  <span>•</span>
                  <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1" /> {new Date(session.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Massive Score Badge dial */}
              <div className="text-center bg-slate-950 border border-slate-850 px-8 py-5 rounded-2xl shadow-inner shrink-0 min-w-[150px]">
                <h3 className="text-4xl font-black text-indigo-400">{session.score || session.overallScore || 0}%</h3>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block mt-1.5">Aggregate AI Score</span>
              </div>
            </div>

            {/* Sub-Metrics Score Caps capsules */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" id="report-submetrics-grid">
              
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Technical Proficiency</span>
                <div className="flex items-baseline space-x-2 mt-1.5">
                  <span className="text-2xl font-black text-white">{session.technicalScore}%</span>
                  <span className="text-xs text-slate-500">/100</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-3.5 border border-slate-850">
                  <div className="bg-indigo-500 h-full" style={{ width: `${session.technicalScore || 0}%` }} />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Communication Fluency</span>
                <div className="flex items-baseline space-x-2 mt-1.5">
                  <span className="text-2xl font-black text-white">{session.communicationScore}%</span>
                  <span className="text-xs text-slate-500">/100</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-3.5 border border-slate-850">
                  <div className="bg-purple-500 h-full" style={{ width: `${session.communicationScore || 0}%` }} />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Professional Confidence</span>
                <div className="flex items-baseline space-x-2 mt-1.5">
                  <span className="text-2xl font-black text-white">{session.confidenceScore}%</span>
                  <span className="text-xs text-slate-500">/100</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mt-3.5 border border-slate-850">
                  <div className="bg-emerald-500 h-full" style={{ width: `${session.confidenceScore || 0}%` }} />
                </div>
              </div>

            </div>

            {/* Split Roadmap & Areas of improvement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Areas of improvement listed */}
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="text-md font-bold text-white mb-4 flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <span>Suggested Focus Areas</span>
                </h3>
                <div className="space-y-3">
                  {session.improvementAreas && session.improvementAreas.map((area, idx) => (
                    <div key={idx} className="flex items-start space-x-3 text-xs bg-slate-950/60 p-3.5 rounded-lg border border-slate-850/60 leading-normal text-slate-300">
                      <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{area}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roadmap timeline bullet */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
                <h3 className="text-md font-bold text-white mb-4 flex items-center space-x-2">
                  <Map className="h-5 w-5 text-indigo-400" />
                  <span>Curated Learning Path</span>
                </h3>
                <div className="bg-slate-950/60 rounded-xl p-4.5 border border-slate-850">
                  <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-wrap font-medium">
                    {session.learningPath}
                  </p>
                </div>
              </div>

            </div>

            {/* Clickable dropdown to toggle Full Questions and evaluations transcript */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-md">
              <button
                id="btn-toggle-questions"
                onClick={() => setShowQuestionsHistory(!showQuestionsHistory)}
                className="w-full flex items-center justify-between text-left cursor-pointer focus:outline-none"
              >
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-md font-bold text-white">Review Assessment Transcript</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 font-semibold">{questions.length} questions itemized</span>
                  <ChevronRight className={`h-4 w-4 text-slate-400 transform transition-transform duration-200 ${showQuestionsHistory ? "rotate-90" : ""}`} />
                </div>
              </button>

              {showQuestionsHistory && (
                <div className="mt-8 space-y-6 pt-6 border-t border-slate-850" id="report-questions-list">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="bg-slate-950/60 border border-slate-850/80 rounded-xl p-5 space-y-4">
                      
                      {/* Top bar rating */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850/40 pb-3">
                        <span className="text-xs text-indigo-400 font-bold block">QUESTION {idx + 1}</span>
                        <div className="flex items-center space-x-1 font-bold text-xs">
                          <span className="text-amber-400">Scorecard: {q.rating || "—"}/10</span>
                        </div>
                      </div>

                      {/* Question Content */}
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-black select-none">Question presented</span>
                        <p className="text-xs font-bold text-slate-200 mt-1">{q.question}</p>
                      </div>

                      {/* Answer Content */}
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-black select-none">Your draft response</span>
                        <p className="text-xs font-mono text-slate-350 bg-slate-900 border border-slate-850/40 rounded-lg p-3 mt-1 whitespace-pre-wrap leading-relaxed text-slate-400">
                          {q.answer || "No response recorded."}
                        </p>
                      </div>

                      {/* Feedback AI Message */}
                      <div className="bg-indigo-950/20 border border-indigo-900/20 rounded-xl p-4 text-xs leading-normal text-indigo-200">
                        <div className="flex items-center space-x-1.5 text-indigo-400 mb-2">
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Structured AI Feedback</span>
                        </div>
                        <p className="mb-3">
                          {q.aiFeedback || "Feedback pending compile."}
                        </p>

                        {/* Crucial Points Missed */}
                        {q.crucialPointsMissed && q.crucialPointsMissed.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-indigo-900/25">
                            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block mb-1">Crucial Point(s) Missed:</span>
                            <ul className="list-disc pl-4 space-y-1 text-slate-300 font-sans">
                              {q.crucialPointsMissed.map((point, pIdx) => (
                                <li key={pIdx}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Areas for Improvement */}
                        {q.areasForImprovement && q.areasForImprovement.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-indigo-900/25">
                            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block mb-1">Actionable Area(s) of Improvement:</span>
                            <ul className="list-disc pl-4 space-y-1 text-slate-300 font-sans">
                              {q.areasForImprovement.map((area, aIdx) => (
                                <li key={aIdx}>{area}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

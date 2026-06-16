/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { InterviewSession, Question } from "../types";
import { 
  Briefcase, 
  ChevronsRight, 
  HelpCircle, 
  MessageSquareCode, 
  Sparkles, 
  Star, 
  ArrowRight, 
  Award, 
  Clock, 
  HeartHandshake, 
  CheckCircle2, 
  Loader2, 
  Zap, 
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MockInterviewProps {
  setCurrentPage: (page: string) => void;
  selectedSessionId: string;
  setSelectedSessionId: (id: string) => void;
}

const ROLES_OPTIONS = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Data Analyst",
  "Data Scientist",
  "Full Stack Developer"
];

const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"] as const;

export const MockInterview: React.FC<MockInterviewProps> = ({ 
  setCurrentPage, 
  selectedSessionId,
  setSelectedSessionId 
}) => {
  // Config stage state
  const [role, setRole] = useState("Software Engineer");
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>("Medium");
  
  // Interactive interview session state
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answerText, setAnswerText] = useState("");
  
  // Loading & status states
  const [setupLoading, setSetupLoading] = useState(false);
  const [evaluatingLoading, setEvaluatingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestFeedback, setLatestFeedback] = useState<{
    rating: number;
    aiFeedback: string;
    crucialPointsMissed?: string[];
    areasForImprovement?: string[];
  } | null>(null);

  useEffect(() => {
    // If a session is active (e.g., re-opened from dashboard), load its details
    if (selectedSessionId) {
      loadSessionState(selectedSessionId);
    }
  }, [selectedSessionId]);

  const loadSessionState = async (id: string) => {
    try {
      setSetupLoading(true);
      setError(null);
      const data = await api.interviews.getSessionDetails(id);
      setSession(data.session);
      setQuestions(data.questions);
      
      // Determine what index the candidate is on
      const answeredCount = data.questions.filter(q => q.answer !== undefined).length;
      if (answeredCount >= data.questions.length) {
        // Already fully answered, direct to final report
        setCurrentPage("final-report");
      } else {
        setCurrentQuestionIdx(answeredCount);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to reconstruct session parameters.");
    } finally {
      setSetupLoading(false);
    }
  };

  const handleStartSession = async () => {
    setSetupLoading(true);
    setError(null);
    try {
      const data = await api.interviews.createSession(role, difficulty);
      setSession(data.session);
      setQuestions(data.questions);
      setSelectedSessionId(data.session.id);
      setCurrentQuestionIdx(0);
      setLatestFeedback(null);
      setAnswerText("");
    } catch (err: any) {
      setError(err?.message || "Error generating mock questions. Check configurations.");
    } finally {
      setSetupLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || !session) return;
    setEvaluatingLoading(true);
    setError(null);
    const activeQ = questions[currentQuestionIdx];
    try {
      const updatedQ = await api.interviews.answerQuestion(activeQ.id, answerText);
      
      // Update local questions record array
      const updatedList = [...questions];
      updatedList[currentQuestionIdx] = updatedQ;
      setQuestions(updatedList);

      setLatestFeedback({
        rating: updatedQ.rating || 5,
        aiFeedback: updatedQ.aiFeedback || "Answer compiled.",
        crucialPointsMissed: updatedQ.crucialPointsMissed,
        areasForImprovement: updatedQ.areasForImprovement
      });
    } catch (err: any) {
      setError(err?.message || "Answer evaluation timed out.");
    } finally {
      setEvaluatingLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentQuestionIdx + 1 < questions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
      setAnswerText("");
      setLatestFeedback(null);
    }
  };

  const handleFinishAndCompile = async () => {
    if (!session) return;
    setSetupLoading(true);
    try {
      await api.interviews.completeSession(session.id);
      setCurrentPage("final-report");
    } catch (err: any) {
      setError(err?.message || "Failed to generate comprehensive AI report card.");
    } finally {
      setSetupLoading(false);
    }
  };

  const handleCancelSession = () => {
    setSession(null);
    setQuestions([]);
    setSelectedSessionId("");
    setLatestFeedback(null);
    setAnswerText("");
  };

  const activeQuestion = questions[currentQuestionIdx];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)] px-6 py-8 md:py-12" id="mock-interview-container">
      <div className="max-w-4xl mx-auto">
        
        {/* Header section toggle info */}
        <div className="flex items-center space-x-3 mb-10">
          <Briefcase className="h-8 w-8 text-indigo-400" />
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Mock Interview Room</h1>
            <p className="text-slate-400 text-sm mt-0.5">Engage in highly realistic interactive technical and HR coordinate sessions.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-900/30 text-red-200 text-xs p-4 rounded-xl flex items-center space-x-2.5 mb-8" id="interview-error">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Global loading spinners */}
        {setupLoading ? (
          <div className="bg-slate-900 border border-slate-800 p-10 rounded-2xl text-center space-y-4" id="interview-setup-loading">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto" />
            <div>
              <h3 className="text-md font-bold text-white">Configuring Questions Matrix</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Gemini 3.5 is crafting 10 bespoke Technical and Situational questions for the applying role. This setup process takes about 5 seconds.
              </p>
            </div>
          </div>
        ) : !session ? (
          /* SECTION 1: INITIATION OPTIONS FORM SCREEN */
          <div className="bg-slate-900 border border-slate-800/85 p-8 rounded-2xl shadow-md space-y-8" id="interview-init-form">
            <div className="border-b border-slate-850 pb-5">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest block mb-1">Interactive Stage</span>
              <h2 className="text-xl font-bold text-white">Configure Active Mock Profile</h2>
            </div>

            {/* Choose Target Role */}
            <div className="space-y-3.5">
              <label className="text-xs font-bold text-slate-300 block">Select Target Technical Role</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="role-cards-grid">
                {ROLES_OPTIONS.map((item) => (
                  <div
                    id={`role-option-${item.replace(/\s+/g, '-').toLowerCase()}`}
                    key={item}
                    onClick={() => setRole(item)}
                    className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${
                      role === item 
                        ? "bg-slate-950 border-indigo-500 shadow-lg shadow-indigo-950/50" 
                        : "bg-slate-950/60 border-slate-850 hover:bg-slate-950"
                    }`}
                  >
                    <Briefcase className={`h-4.5 w-4.5 mx-auto mb-2 ${role === item ? "text-indigo-400" : "text-slate-500"}`} />
                    <span className="text-xs font-bold block">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Choose Game Difficulty */}
            <div className="space-y-3.5">
              <label className="text-xs font-bold text-slate-300 block">Interview Difficulty Tier</label>
              <div className="flex space-x-3" id="difficulty-pills-container">
                {DIFFICULTY_LEVELS.map((level) => (
                  <button
                    id={`diff-option-${level.toLowerCase()}`}
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      difficulty === level 
                        ? "bg-slate-950 border border-indigo-500 text-indigo-400 shadow-md shadow-indigo-950/25" 
                        : "bg-slate-950/40 border border-slate-850 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="pt-4 border-t border-slate-850 flex items-center justify-between">
              <button
                id="btn-interview-cancel"
                onClick={() => setCurrentPage("dashboard")}
                className="text-xs text-slate-400 hover:text-slate-200 hover:underline cursor-pointer font-semibold"
              >
                Return to Dashboard
              </button>
              <button
                id="btn-interview-initiate"
                onClick={handleStartSession}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl flex items-center space-x-2 text-xs shadow-md shadow-indigo-950/40 transition-transform cursor-pointer"
              >
                <span>Generate Questions Matrix</span>
                <AnimatePresence mode="wait">
                  <ArrowRight className="h-4 w-4" />
                </AnimatePresence>
              </button>
            </div>
          </div>
        ) : (
          /* SECTION 2: CHAT INTERACTIVE PANEL SIMULATOR */
          <div className="space-y-6" id="interview-active-chat">
            
            {/* Session stats indicator bar */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-3.5 text-xs text-slate-400 select-none">
                <span className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded text-slate-300 font-bold">{session.role}</span>
                <span>•</span>
                <span className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded text-slate-300 font-bold uppercase">{session.difficulty}</span>
              </div>
              <button
                id="btn-interview-abandon"
                onClick={handleCancelSession}
                className="text-xs text-red-400 hover:text-red-300 hover:underline font-semibold cursor-pointer"
              >
                Abandon Session
              </button>
            </div>

            {/* Core Question Content card presentation */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              
              {/* Question progress */}
              <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-6">
                <div className="flex items-center space-x-2">
                  <MessageSquareCode className="h-5 w-5 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-400">STAGE {currentQuestionIdx + 1} OF {questions.length}</span>
                </div>

                {/* Progress bar line */}
                <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full transition-all duration-200" 
                    style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question text */}
              <h2 className="text-md sm:text-lg font-bold text-slate-100 leading-normal mb-8 leading-snug">
                {activeQuestion ? activeQuestion.question : ""}
              </h2>

              {/* Answer submission text panel */}
              {evaluatingLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3" id="evaluating-loader">
                  <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                  <p className="text-xs text-indigo-300 font-semibold animate-pulse">Recruiter compiling detailed AI micro-scores...</p>
                </div>
              ) : latestFeedback ? (
                /* MICRO SCORE FEEDBACK CONTAINER */
                <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-5 md:p-6 space-y-4" id="active-feedback-card">
                  <div className="flex items-center justify-between border-b border-slate-850/60 pb-3.5">
                    <div className="flex items-center space-x-1.5 font-bold">
                      <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                      <span className="text-xs text-white uppercase tracking-wider">AI Micro Assessment</span>
                    </div>

                    {/* Numeric Stars rating system */}
                    <div className="flex items-center space-x-1 font-bold text-xs">
                      <span className="text-amber-400">{latestFeedback.rating}/10</span>
                      <div className="flex space-x-0.5">
                        {Array.from({ length: 5 }).map((_, sidx) => (
                          <Star 
                            key={sidx} 
                            className={`h-3 w-3 ${
                              sidx < Math.round(latestFeedback.rating / 2) ? "text-amber-400 fill-amber-400" : "text-slate-700"
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5" id="assessment-main-feedback">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block font-mono">Feedback Summary</span>
                    <p className="text-xs leading-relaxed text-slate-300 font-medium">
                      {latestFeedback.aiFeedback}
                    </p>
                  </div>

                  {/* Crucial Points Missed */}
                  {latestFeedback.crucialPointsMissed && latestFeedback.crucialPointsMissed.length > 0 && (
                    <div className="bg-red-950/30 border border-red-900/20 p-4 rounded-xl space-y-2 mt-2" id="feedback-crucial-points">
                      <div className="flex items-center space-x-2 text-red-400 font-bold text-xs select-none">
                        <AlertCircle className="h-4 w-4 shrink-0 animate-pulse" />
                        <span className="uppercase tracking-wider font-mono">Crucial Point(s) Missed</span>
                      </div>
                      <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1 leading-relaxed font-sans">
                        {latestFeedback.crucialPointsMissed.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Areas for Improvement */}
                  {latestFeedback.areasForImprovement && latestFeedback.areasForImprovement.length > 0 && (
                    <div className="bg-amber-955/20 border border-amber-900/20 p-4 rounded-xl space-y-2 mt-2" id="feedback-areas-improvement">
                      <div className="flex items-center space-x-2 text-amber-500 font-bold text-xs select-none">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="uppercase tracking-wider font-mono">Actionable Area(s) of Improvement</span>
                      </div>
                      <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1 leading-relaxed font-sans">
                        {latestFeedback.areasForImprovement.map((area, index) => (
                          <li key={index}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions to move on */}
                  <div className="pt-4 border-t border-slate-850/60 flex justify-end">
                    {currentQuestionIdx + 1 < questions.length ? (
                      <button
                        id="btn-feedback-next"
                        onClick={handleNextStep}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-lg text-xs flex items-center space-x-1 shadow transform cursor-pointer"
                      >
                        <span>Next Question</span>
                        <ChevronsRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        id="btn-feedback-complete"
                        onClick={handleFinishAndCompile}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-lg text-xs flex items-center space-x-1.5 shadow cursor-pointer animate-bounce"
                      >
                        <HeartHandshake className="h-4 w-4" />
                        <span>Compile Final Report</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* IN-INPUT CHAT BOX EXPORT PANEL */
                <div className="space-y-4" id="interview-user-response">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Configure your draft answer (be as complete as possible)</span>
                  <textarea
                    id="textarea-answer-draft"
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Draft technical explanations using structural patterns. E.g. capture architectural paradigms, details on complexity variables, operational tools under ACID constraints, or specify solid situations if HR-focused."
                    className="w-full h-44 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors leading-relaxed font-mono resize-none"
                    required
                  />

                  <div className="flex justify-between items-center pt-3 border-t border-slate-850">
                    <span className="text-[10px] text-slate-500 font-medium">Detailed and well-structured answers get higher AI evaluations.</span>
                    <button
                      id="btn-answer-submit"
                      type="button"
                      disabled={!answerText.trim()}
                      onClick={handleSubmitAnswer}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-950/40 text-white font-bold py-2 px-5 rounded-lg text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <Zap className="h-3.5 w-3.5 fill-white text-white" />
                      <span>Evaluate This Answer</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

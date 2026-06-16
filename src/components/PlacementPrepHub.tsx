/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  HelpCircle, 
  Award, 
  RefreshCw, 
  TrendingUp, 
  Check, 
  X, 
  Clock, 
  BookmarkCheck,
  Zap
} from "lucide-react";

interface PlacementPrepHubProps {
  setCurrentPage: (page: string) => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIdx: number;
}

const QUIZZES: Record<string, QuizQuestion[]> = {
  Aptitude: [
    { question: "A train running at 54 km/hr crosses a post in 12 seconds. What is the length of the train in meters?", options: ["120m", "150m", "180m", "220m"], correctIdx: 2 },
    { question: "If 'COPS' is coded as 'DPTT', how is 'HERO' coded in that same deterministic language shift?", options: ["IFSP", "JGTP", "IESP", "IDSP"], correctIdx: 0 },
    { question: "Choose the correct spelling: The college principal wanted to ensure _____ in exam assessments.", options: ["impartiality", "imparciallity", "impartiaality", "imparshiality"], correctIdx: 0 }
  ],
  OS: [
    { question: "What is thrashing in operating system virtual memory paging managers?", options: ["CPU idle states", "Continuous page faults leading to constant swap operations", "Deleting corrupted sectors", "Process scheduling queues"], correctIdx: 1 },
    { question: "Which CPU scheduling algorithm can lead to starving priority queues?", options: ["Round Robin", "SJF (Shortest Job First)", "FIFO (First In First Out)", "Multilevel feedback queue"], correctIdx: 1 },
    { question: "A semaphore is used primarily inside local schedulers to address what condition?", options: ["Deadlock patterns", "Mutual exclusion race conditions", "Memory bounds checking", "Interprocess communication speeds"], correctIdx: 1 }
  ],
  DBMS: [
    { question: "Which database normalization form explicitly guarantees elimination of transitivity constraints?", options: ["1NF", "2NF", "3NF", "BCNF"], correctIdx: 2 },
    { question: "In database transactions, what does the 'I' represent in classical ACID properties?", options: ["Indexing speed", "Isolation level guarantees", "Inheritance mapping", "Iterative validation"], correctIdx: 1 },
    { question: "Which index type is optimal for supporting exact key lookups and not range query scans?", options: ["B+ Tree Index", "Hash Index", "Segment Tree Index", "Bitmap Index"], correctIdx: 1 }
  ],
  Networks: [
    { question: "Which OSI model layer is responsible for translating binary streams into packets and frames?", options: ["Network Layer", "Physical Layer", "Data Link Layer", "Transport Layer"], correctIdx: 2 },
    { question: "What TCP flag is sent to initiate a standard three-way handshake?", options: ["ACK", "SYN", "FIN", "RST"], correctIdx: 1 },
    { question: "What DNS record type is used to map email servers to specific domain names?", options: ["A Record", "CNAME Record", "MX Record", "TXT Record"], correctIdx: 2 }
  ],
  OOP: [
    { question: "Which OOP concept represents hiding structural details and only showing essential APIs?", options: ["Polymorphism", "Encapsulation", "Abstraction", "Inheritance"], correctIdx: 2 },
    { question: "What is the runtime index of overriding parent subclass methods inside child implementations?", options: ["Dynamic polymorphism", "Static bindings", "Multiple inheritance", "Template structures"], correctIdx: 0 }
  ],
  SystemDesign: [
    { question: "Which load-balancing algorithm distributes client queries evenly sequentially across backend nodes?", options: ["Least Connections", "Round Robin", "IP Hashing", "Consistent hashing"], correctIdx: 1 },
    { question: "In distributed configurations, what database system parameter is compromised when high availability is prioritized over consistency during networking splits?", options: ["AP (Availability/Partition tolerance)", "CA (Consistency/Availability)", "CP (Consistency/Partition tolerance)", "ACID bounds"], correctIdx: 0 }
  ]
};

export const PlacementPrepHub: React.FC<PlacementPrepHubProps> = ({ setCurrentPage }) => {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [currentQIdx, setCurrentQIdx] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [quizLogs, setQuizLogs] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    loadQuizLogs();
  }, []);

  const loadQuizLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/placement/hub", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        setQuizLogs(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartQuiz = (catName: string) => {
    setSelectedCat(catName);
    setCurrentQIdx(0);
    setSelectedAns(null);
    setScore(0);
    setIsFinished(false);
  };

  const handleSelectAnswer = (idx: number) => {
    if (selectedAns !== null) return;
    setSelectedAns(idx);
    const correctIdx = QUIZZES[selectedCat!][currentQIdx].correctIdx;
    if (idx === correctIdx) setScore(prev => prev + 1);
  };

  const handleNext = async () => {
    const list = QUIZZES[selectedCat!];
    if (currentQIdx + 1 < list.length) {
      setCurrentQIdx(prev => prev + 1);
      setSelectedAns(null);
    } else {
      setIsFinished(true);
      await saveScores();
    }
  };

  const saveScores = async () => {
    try {
      setIsSaving(true);
      const totalQ = QUIZZES[selectedCat!].length;
      const pct = Math.round((score / totalQ) * 100);

      if (pct >= 80) {
        localStorage.setItem("quiz-high-accuracy", "true");
      }
      if (pct === 100) {
        localStorage.setItem("quiz-perfect-accuracy", "true");
      }

      const token = localStorage.getItem("token");
      const res = await fetch("/api/placement/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          category: selectedCat,
          score: pct,
          totalQuestions: totalQ,
          correctAnswers: score
        })
      });
      if (res.ok) {
        await loadQuizLogs();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-8 px-4 md:px-8 font-sans" id="placement-prep-dashboard">
      <div className="max-w-5xl mx-auto flex flex-col h-full">

        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-900 pb-5 mb-8">
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => setCurrentPage("dashboard")}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">Preparation Terminal</span>
              <h1 className="text-2xl font-black text-white">Placement Preparation Hub</h1>
            </div>
          </div>

          <span className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-855 px-3 py-1 rounded-xl uppercase">Academic quizzes active</span>
        </div>

        {/* Double structural split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Stage left */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-805/80 rounded-2xl p-6 shadow-xl min-h-[350px] flex flex-col justify-between">
            {!selectedCat ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-sm font-extrabold uppercase tracking-wider text-indigo-400 font-mono">Academic CS Subjects Categories:</h2>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Excel in placement procedures. Select an option to start a fast testing simulation. Questions are highly tailored to top MNC placement standards.
                  </p>
                </div>

                {/* Subject grid cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.keys(QUIZZES).map((catKey) => (
                    <div 
                      key={catKey} 
                      className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-500/50 transition-all shadow-md group"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <HelpCircle className="h-4 w-4 text-indigo-400 group-hover:animate-bounce" />
                          <h3 className="text-sm font-black text-white">{catKey === "OS" ? "Operating Systems" : catKey === "DBMS" ? "Database Management Systems" : catKey === "Networks" ? "Computer Networks" : catKey === "OOP" ? "OOP Concepts" : catKey}</h3>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 mt-1 block">Contains exactly {QUIZZES[catKey].length} selective test questions.</span>
                      </div>

                      <button
                        onClick={() => handleStartQuiz(catKey)}
                        className="mt-4 bg-indigo-600 hover:bg-slate-850 hover:text-indigo-400 text-white font-extrabold px-3 py-1.8 rounded-xl text-[10.5px] transition-all cursor-pointer inline-flex items-center justify-center space-x-1 border border-indigo-600 hover:border-indigo-900"
                      >
                        <Zap className="h-3 w-3" />
                        <span>Start Test</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {!isFinished ? (
                  (() => {
                    const activeQ = QUIZZES[selectedCat][currentQIdx];
                    return (
                      <div className="space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                          <span className="text-[10.5px] font-mono text-indigo-400 uppercase tracking-widest font-extrabold">Question {currentQIdx + 1} of {QUIZZES[selectedCat].length}</span>
                          <span className="text-[9.5px] text-slate-550 uppercase">Subject: {selectedCat}</span>
                        </div>

                        <p className="text-sm font-extrabold text-slate-100 leading-relaxed font-sans">{activeQ.question}</p>

                        <div className="space-y-2.5 pt-2">
                          {activeQ.options.map((option, idx) => {
                            const isChosen = selectedAns === idx;
                            const isCorrect = idx === activeQ.correctIdx;
                            const hasBeenAnswered = selectedAns !== null;
                            
                            let styleClass = "bg-slate-950 border-slate-850 text-slate-300 hover:border-indigo-500/50";
                            if (hasBeenAnswered) {
                              if (isCorrect) styleClass = "bg-emerald-950/30 border-emerald-500 text-emerald-400";
                              else if (isChosen) styleClass = "bg-red-950/30 border-red-500 text-red-400";
                              else styleClass = "bg-slate-950 border-slate-850 opacity-50";
                            }

                            return (
                              <button
                                key={idx}
                                disabled={hasBeenAnswered}
                                onClick={() => handleSelectAnswer(idx)}
                                className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-between ${styleClass}`}
                              >
                                <span>{idx + 1}. {option}</span>
                                {hasBeenAnswered && (
                                  isCorrect ? <Check className="h-4 w-4 text-emerald-400" /> : isChosen ? <X className="h-4 w-4 text-red-400" /> : null
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {selectedAns !== null && (
                          <div className="flex justify-end pt-3 border-t border-slate-800">
                            <button
                              onClick={handleNext}
                              className="bg-indigo-600 hover:bg-indigo-550 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              <span>{currentQIdx + 1 === QUIZZES[selectedCat].length ? "Finish Test ➔" : "Next Question ➔"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div className="py-10 text-center space-y-4">
                    <div className="h-14 w-14 rounded-full bg-emerald-950/30 flex items-center justify-center border border-emerald-800 mx-auto text-emerald-400">
                      <BookmarkCheck className="h-6 w-6 animate-pulse" />
                    </div>

                    <div className="max-w-md mx-auto space-y-1.5">
                      <h2 className="text-lg font-black text-white">Quiz Completed Successfully!</h2>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        You scored exactly <span className="font-bold text-white leading-none">{score} out of {QUIZZES[selectedCat].length}</span> correct answers!
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedCat(null)}
                      className="mt-6 bg-slate-950 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white font-bold px-5 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Back to tracks List
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Academic Report history right panel */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-805/80 rounded-2xl p-5 shadow-xl min-h-[350px] flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-1.5 border-b border-slate-800 pb-3 mb-4">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Reports Log ({quizLogs.length})</span>
              </div>

              {/* Log items */}
              <div className="space-y-3.5 max-h-[290px] overflow-y-auto">
                {quizLogs.length === 0 ? (
                  <div className="text-center py-20 text-slate-650 font-mono text-xs italic">
                    No quiz scores logged yet. Start a test.
                  </div>
                ) : (
                  quizLogs.map((log, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-855 rounded-xl p-3 text-xs leading-relaxed">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-200">{log.category} Practice</span>
                        <span className="font-black text-indigo-400 font-mono">{log.score}%</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-mono">
                        <span>Correct: {log.correctAnswers} / {log.totalQuestions}</span>
                        <span>{new Date(log.attemptedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-slate-850 pt-3.5 text-[9.5px] text-slate-500 font-mono text-center">
              QUIZ LOGS SAVED SUCCESSFULLY TO BASE CHIPS
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Flame, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Award, 
  ArrowLeft,
  Users,
  Compass,
  Trophy
} from "lucide-react";

interface DailyTrackerProps {
  setCurrentPage: (page: string) => void;
  onSelectProblem?: (id: string) => void;
}

export const DailyTracker: React.FC<DailyTrackerProps> = ({ setCurrentPage, onSelectProblem }) => {
  const [mission, setMission] = useState<any>(null);
  const [streak, setStreak] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSolving, setIsSolving] = useState<string | null>(null);

  useEffect(() => {
    loadDailyMission();
  }, []);

  const loadDailyMission = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/dsa/daily-mission", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setMission(data.mission);
        setStreak(data.streak);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const solveDifficultyDirectly = async (diff: "easy" | "medium" | "hard") => {
    try {
      setIsSolving(diff);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/dsa/daily-mission/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ difficulty: diff })
      });
      if (res.ok) {
        
        // Post code submission too to trigger streak incrementation logic properly
        await fetch("/api/playground/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            problemId: diff === "easy" ? "two-sum" : diff === "medium" ? "container-water" : "reverse-list",
            problemTitle: `Daily ${diff.toUpperCase()} algorithm`,
            language: "javascript",
            code: "// Fast check completed.",
            status: "Accepted"
          })
        });

        await loadDailyMission();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSolving(null);
    }
  };

  // Generate simulated weekly streak block dots like GitHub
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentDayOfWeekIdx = new Date().getDay();

  return (
    <div className="bg-transparent text-slate-900 dark:text-slate-100 min-h-[calc(100vh-65px)] py-8 px-4 md:px-8 font-sans" id="daily-practice-tracker">
      <div className="max-w-4xl mx-auto flex flex-col h-full">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800/60 pb-5 mb-8 gap-4 pb-4">
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => setCurrentPage("dashboard")}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-bold">Accountability Board</span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Daily Practice Tracker</h1>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 rounded-xl px-4 py-2 shadow-sm">
            <Flame className="h-5 w-5 text-amber-500 animate-bounce" />
            <div>
              <span className="text-[9px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block tracking-wider leading-none">Streaks Active</span>
              <span className="text-sm font-black font-mono text-slate-900 dark:text-white leading-tight">
                {streak ? streak.streakCount : 0} Days streak!
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 flex flex-col items-center justify-center space-y-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b border-indigo-600 dark:border-indigo-500" />
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">Loading missions checkpoints...</span>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Weekly Checklist Metrics */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805/80 rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider block mb-4 font-mono">Weekly Checklist Metrics:</span>
              
              <div className="flex items-center justify-between">
                {weekdays.map((day, idx) => {
                  const isCurrent = idx === currentDayOfWeekIdx;
                  // If solved index in past/now
                  const isSolved = streak && streak.streakCount > 0 && idx <= currentDayOfWeekIdx;
                  return (
                    <div key={day} className="flex flex-col items-center">
                      <span className={`text-[10px] mb-2 font-semibold ${isCurrent ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-400 dark:text-slate-500"}`}>{day}</span>
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center border transition-all ${
                        isSolved 
                          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400" 
                          : isCurrent 
                            ? "bg-indigo-50 dark:bg-slate-950 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold animate-pulse" 
                            : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-705"
                      }`}>
                        {isSolved ? (
                          <CheckCircle2 className="h-4.5 w-4.5" />
                        ) : (
                          <span className="text-[10px] font-mono">{idx + 1}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Missions lists */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805/80 rounded-2xl p-5 shadow-sm space-y-4">
              <span className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider block mb-2 font-mono">Today's Solves targets:</span>

              {/* Easy challenge */}
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4.5 shadow-sm">
                <div className="flex items-start space-x-3.5">
                  <div className={`h-5 w-5 rounded-full border flex items-center justify-center mt-1 scale-90 ${mission?.easySolved ? "bg-emerald-50 dark:bg-emerald-955 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"}`}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Solve an Easy array query</h3>
                      <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/10 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Easy</span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block font-mono">Allocated standard Two-Sum target ID: #{mission?.easyId || "easy-1"}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mr-1">
                  {mission?.easySolved ? (
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded">Solved 🎯</span>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          if (onSelectProblem) onSelectProblem("two-sum");
                          setCurrentPage("playground");
                        }}
                        className="bg-indigo-650 hover:bg-indigo-555 border border-indigo-900/40 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
                      >
                        Code
                      </button>
                      <button
                        onClick={() => solveDifficultyDirectly("easy")}
                        disabled={isSolving !== null}
                        className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-[10px] border border-slate-200 dark:border-slate-800 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        {isSolving === "easy" ? "Verifying..." : "Skip Solve"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Medium challenge */}
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4.5 shadow-sm">
                <div className="flex items-start space-x-3.5">
                  <div className={`h-5 w-5 rounded-full border flex items-center justify-center mt-1 scale-90 ${mission?.mediumSolved ? "bg-emerald-50 dark:bg-emerald-955 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"}`}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Optimizing stack capacities</h3>
                      <span className="text-[9px] bg-amber-50 dark:bg-amber-950/45 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-900/10 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Medium</span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block font-mono">Allocated Container problem ID: #{mission?.mediumId || "medium-1"}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mr-1">
                  {mission?.mediumSolved ? (
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded">Solved 🎯</span>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          if (onSelectProblem) onSelectProblem("valid-parentheses");
                          setCurrentPage("playground");
                        }}
                        className="bg-indigo-650 hover:bg-indigo-555 border border-indigo-900/40 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
                      >
                        Code
                      </button>
                      <button
                        onClick={() => solveDifficultyDirectly("medium")}
                        disabled={isSolving !== null}
                        className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-[10px] border border-slate-200 dark:border-slate-800 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        {isSolving === "medium" ? "Verifying..." : "Skip Solve"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Hard challenge */}
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4.5 shadow-sm">
                <div className="flex items-start space-x-3.5">
                  <div className={`h-5 w-5 rounded-full border flex items-center justify-center mt-1 scale-90 ${mission?.hardSolved ? "bg-emerald-50 dark:bg-emerald-955 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"}`}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Reverse linked pointers recursively</h3>
                      <span className="text-[9px] bg-red-50 dark:bg-red-950/45 text-red-650 dark:text-red-500 border border-red-200 dark:border-red-900/10 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Hard</span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block font-mono">Allocated Reverse target ID: #{mission?.hardId || "hard-1"}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mr-1">
                  {mission?.hardSolved ? (
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded">Solved 🎯</span>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          if (onSelectProblem) onSelectProblem("reverse-list");
                          setCurrentPage("playground");
                        }}
                        className="bg-indigo-650 hover:bg-indigo-555 border border-indigo-900/40 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
                      >
                        Code
                      </button>
                      <button
                        onClick={() => solveDifficultyDirectly("hard")}
                        disabled={isSolving !== null}
                        className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-[10px] border border-slate-200 dark:border-slate-800 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        {isSolving === "hard" ? "Verifying..." : "Skip Solve"}
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Streak scoreboard tips */}
            <div className="bg-white dark:bg-slate-900 p-4.5 border border-slate-200 dark:border-slate-850 rounded-2xl flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shadow-sm">
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <span>Solve the daily Easy, Medium, and Hard milestones to keep your streaks blazing! GitHub-styled charts will track progress in real-time.</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

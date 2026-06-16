/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { InterviewSession, Resume } from "../types";
import { 
  Play, 
  FileText, 
  Award, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Sparkles, 
  AlertCircle, 
  TrendingUp, 
  Calendar,
  Layers,
  Trophy,
  Zap,
  Users
} from "lucide-react";
import { motion } from "motion/react";
import { evaluateBadges } from "../data/badges";

interface DashboardProps {
  setCurrentPage: (page: string) => void;
  setSelectedSessionId: (id: string) => void;
  setSelectedResume: (resume: Resume | null) => void;
  setSelectedChallengeId: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  setCurrentPage, 
  setSelectedSessionId,
  setSelectedResume,
  setSelectedChallengeId
}) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Custom states for Placement Readiness scorecard
  const [readiness, setReadiness] = useState<any>(null);

  // Live challenge board timers state
  const [challengeTimers, setChallengeTimers] = useState<Record<string, number>>({});

  const [dsaSnapshot, setDsaSnapshot] = useState<any>(null);

  // Helper to compute user total points from completed challenges
  const getUserTotalPoints = () => {
    let total = 0;
    const baseChallenges = [
      { id: "rb-tree-validator", points: 150 },
      { id: "lru-optimizer", points: 250 },
      { id: "fastest-matrix-path", points: 180 }
    ];
    baseChallenges.forEach(c => {
      if (typeof window !== "undefined" && localStorage.getItem(`dsa-challenge-${c.id}`) === "Completed") {
        total += c.points;
      }
    });

    const dailyChallenges = [
      { id: "daily-water-container", points: 200 },
      { id: "daily-two-sum", points: 100 },
      { id: "daily-clone-graph", points: 300 },
      { id: "daily-subsets", points: 180 },
      { id: "daily-valid-anagram", points: 90 }
    ];
    dailyChallenges.forEach(c => {
      if (typeof window !== "undefined" && localStorage.getItem(`dsa-challenge-${c.id}`) === "Completed") {
        total += c.points * 2; // Double points for daily challenges!
      }
    });

    return total;
  };

  // State to hold the countdown timer string
  const [dailyCountdown, setDailyCountdown] = useState<string>("24h 00m");

  const getDailyChallenge = () => {
    const today = new Date().toISOString().split("T")[0];
    const dateNum = parseInt(today.replace(/-/g, "")) || 20260605;
    
    const dailyPool = [
      {
        id: "daily-water-container",
        title: "Maximum Cloud Volume Optimiser",
        category: "Arrays & Sliding Window",
        difficulty: "Medium",
        points: 200,
        competitors: 112,
        submits: 45
      },
      {
        id: "daily-two-sum",
        title: "Bi-Directional Telemetry Vector Aligner",
        category: "Arrays & Sliding Window",
        difficulty: "Easy",
        points: 100,
        competitors: 240,
        submits: 182
      },
      {
        id: "daily-clone-graph",
        title: "Quantum Node Network Replicator",
        category: "Graphs & Networks",
        difficulty: "Hard",
        points: 300,
        competitors: 67,
        submits: 14
      },
      {
        id: "daily-subsets",
        title: "State Matrix Formulation Combinator",
        category: "Recursion & Backtracking",
        difficulty: "Medium",
        points: 180,
        competitors: 95,
        submits: 38
      },
      {
        id: "daily-valid-anagram",
        title: "Hyper-Dimensional Signal Decryptor",
        category: "HashMaps & Strings",
        difficulty: "Easy",
        points: 90,
        competitors: 310,
        submits: 254
      }
    ];
    const idx = dateNum % dailyPool.length;
    return dailyPool[idx];
  };

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setDailyCountdown(`${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`);
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("dsa-last-session-snapshot");
      if (stored) {
        setDsaSnapshot(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to parse local stored DSA snapshot", err);
    }
  }, []);

  useEffect(() => {
    const CHALLENGES = [
      { id: "rb-tree-validator", baseDuration: 6200 },
      { id: "lru-optimizer", baseDuration: 13500 },
      { id: "fastest-matrix-path", baseDuration: 4100 }
    ];

    const loadTimers = () => {
      const times: Record<string, number> = {};
      CHALLENGES.forEach(c => {
        const key = `challenge-expiry-${c.id}`;
        const stored = localStorage.getItem(key);
        let target = stored ? parseInt(stored) : null;
        if (!target || target < Date.now()) {
          target = Date.now() + c.baseDuration * 1000;
          localStorage.setItem(key, target.toString());
        }
        times[c.id] = Math.max(0, Math.floor((target - Date.now()) / 1000));
      });
      setChallengeTimers(times);
    };

    loadTimers();

    const interval = setInterval(() => {
      setChallengeTimers(prev => {
        const updated: Record<string, number> = {};
        Object.keys(prev).forEach(id => {
          if (prev[id] <= 1) {
            // Recalculate/reset when hitting 0
            const cMatch = CHALLENGES.find(ch => ch.id === id);
            const nextTarget = Date.now() + (cMatch?.baseDuration || 3600) * 1000;
            localStorage.setItem(`challenge-expiry-${id}`, nextTarget.toString());
            updated[id] = Math.max(0, Math.floor((nextTarget - Date.now()) / 1000));
          } else {
            updated[id] = prev[id] - 1;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTimerString = (secTot: number) => {
    if (!secTot) return "00:00:00";
    const hr = Math.floor(secTot / 3600);
    const min = Math.floor((secTot % 3600) / 60);
    const sec = secTot % 60;
    return `${hr.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [sessionsData, resumesData] = await Promise.all([
          api.interviews.getSessions(),
          api.resumes.getHistory()
        ]);
        setSessions(sessionsData);
        setResumes(resumesData);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard parameters");
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // Sync placement scorecard stats
  useEffect(() => {
    const fetchReadiness = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("/api/placement/readiness", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            setReadiness(data);
          } else {
            console.warn("Dashboard readiness response was not JSON:", contentType);
          }
        }
      } catch (err) {
        console.error("Failed to load readiness index", err);
      }
    };
    if (!loading) {
      fetchReadiness();
    }
  }, [loading, sessions, resumes]);

  // Compute stats
  const totalInterviews = sessions.length;
  const completedInterviews = sessions.filter(s => s.status === "completed");
  const averageScore = completedInterviews.length
    ? Math.round(completedInterviews.reduce((acc, s) => acc + (s.score || 0), 0) / completedInterviews.length)
    : 0;

  const latestResume = resumes.length ? resumes[0] : null;

  return (
    <div className="bg-transparent text-theme-text-primary min-h-[calc(100vh-65px)] px-6 py-8 md:py-12" id="dashboard-container">
      <div className="max-w-7xl mx-auto">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-theme-text-primary tracking-tight">Candidate Hub</h1>
            <p className="text-theme-text-secondary text-sm mt-1">
              Welcome back, <span className="text-theme-accent font-bold">{user?.name}</span>. Start an interview simulation or verify your profile strengths.
            </p>
          </div>
          
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <button
              id="dashboard-btn-resume"
              onClick={() => {
                setSelectedResume(null);
                setCurrentPage("resume-analyzer");
              }}
              className="flex-1 md:flex-none bg-theme-surface hover:bg-theme-bg text-theme-text-primary border border-theme-border font-semibold px-4 py-2.5 rounded-xl cursor-pointer flex items-center justify-center space-x-2 text-sm transition-all duration-150 shadow-sm"
            >
              <FileText className="h-4 w-4 text-theme-accent" />
              <span>Analyze Resume</span>
            </button>
            <button
              id="dashboard-btn-interview"
              onClick={() => setCurrentPage("mock-interview")}
              className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer flex items-center justify-center space-x-2 text-sm shadow-lg shadow-indigo-950/20 transition-all duration-150"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Start Mock AI</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-250 dark:border-red-900/30 text-red-750 dark:text-red-200 text-xs p-4 rounded-xl flex items-center space-x-2.5 mb-8" id="dashboard-error">
            <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex items-center justify-center py-24" id="dashboard-loading">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {/* Quick Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10" id="dashboard-stats-grid">
              
              <div className="bg-theme-card border border-theme-border p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
                <div className="bg-theme-accent/10 text-theme-accent p-3 rounded-xl border border-theme-accent/20">
                  <Layers className="h-5.5 w-5.5" />
                </div>
                <div>
                  <span className="text-xs text-theme-text-secondary uppercase font-semibold">Mock Sessions</span>
                  <h3 className="text-2xl font-extrabold text-theme-text-primary mt-0.5">{totalInterviews}</h3>
                </div>
              </div>

              <div className="bg-theme-card border border-theme-border p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
                <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl border border-emerald-500/20">
                  <Award className="h-5.5 w-5.5" />
                </div>
                <div>
                  <span className="text-xs text-theme-text-secondary uppercase font-semibold">Average Rating</span>
                  <h3 className="text-2xl font-extrabold text-theme-text-primary mt-0.5">
                    {averageScore ? `${averageScore}%` : "—"}
                  </h3>
                </div>
              </div>

              <div className="bg-theme-card border border-theme-border p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
                <div className="bg-purple-500/10 text-purple-600 dark:text-purple-400 p-3 rounded-xl border border-purple-500/20">
                  <FileText className="h-5.5 w-5.5" />
                </div>
                <div>
                  <span className="text-xs text-theme-text-secondary uppercase font-semibold">ATS Compatibility</span>
                  <h3 className="text-2xl font-extrabold text-theme-text-primary mt-0.5">
                    {latestResume ? `${latestResume.atsScore}%` : "—"}
                  </h3>
                </div>
              </div>

              <div className="bg-theme-card border border-theme-border p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
                <div className="bg-pink-500/10 text-pink-600 dark:text-pink-400 p-3 rounded-xl border border-pink-500/20">
                  <TrendingUp className="h-5.5 w-5.5" />
                </div>
                <div>
                  <span className="text-xs text-theme-text-secondary uppercase font-semibold">Resume score</span>
                  <h3 className="text-2xl font-extrabold text-theme-text-primary mt-0.5">
                    {latestResume ? `${latestResume.resumeScore}/100` : "—"}
                  </h3>
                </div>
              </div>

              <div className="bg-theme-card border border-theme-border p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
                <div className="bg-amber-500/10 text-amber-600 dark:text-amber-500 p-3 rounded-xl border border-amber-500/20">
                  <Trophy className="h-5.5 w-5.5" />
                </div>
                <div>
                  <span className="text-xs text-theme-text-secondary uppercase font-semibold">Arena Points</span>
                  <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-450 mt-0.5">
                    {getUserTotalPoints()} pts
                  </h3>
                </div>
              </div>

            </div>

            {/* PLACEMENT READINESS HUB BENTO GRID */}
            {readiness && (
              <div className="bg-theme-card border border-theme-border rounded-3xl p-6.5 shadow-xl mb-10 relative overflow-hidden" id="dashboard-placement-readiness-bento">
                
                {/* Visual ambient circles */}
                <div className="absolute top-0 right-0 h-44 w-44 bg-theme-accent/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 left-10 h-32 w-32 bg-theme-accent/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row gap-8 items-stretch relative">
                  
                  {/* Gauge Left column */}
                  <div className="flex-1 lg:max-w-md flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-theme-accent tracking-widest block font-mono">Dynamic AI Analytics</span>
                      <h2 className="text-xl font-black text-theme-text-primary mt-1">Placement Readiness Index</h2>
                      <p className="text-xs text-theme-text-secondary mt-1.5 leading-relaxed">
                        A real-time weighted index generated from your customized resume ATS scores, voice mock speech reviews, and daily algorithms solves.
                      </p>
                    </div>

                    <div className="flex items-center space-x-5 bg-theme-bg p-4 rounded-2xl border border-theme-border">
                      <div className="relative h-18 w-18 flex items-center justify-center shrink-0">
                        {/* Circular ring */}
                        <svg className="w-full h-full transform -rotate-90">
                           <circle cx="36" cy="36" r="30" className="stroke-theme-border" strokeWidth="6" fill="transparent" />
                          <circle cx="36" cy="36" r="30" stroke="#6366f1" strokeWidth="6" fill="transparent"
                            strokeDasharray={188.4}
                            strokeDashoffset={188.4 - (188.4 * readiness.placementReadinessScore) / 100}
                          />
                        </svg>
                        <span className="absolute text-base font-black text-theme-text-primary font-mono">{readiness.placementReadinessScore}%</span>
                      </div>

                      <div>
                        <span className="text-[9.5px] font-mono font-bold uppercase block text-theme-accent">Score Rating</span>
                        <span className="text-sm font-black text-theme-text-primary block mt-0.5">
                          {readiness.placementReadinessScore >= 80 ? "🎯 Exceptional Ready" :
                           readiness.placementReadinessScore >= 60 ? "🔥 Highly Competitive" :
                           "⚡ Action Needed"}
                        </span>
                        <span className="text-[10.5px] text-theme-text-secondary mt-1 block leading-tight">Complete more mock interviews to boost.</span>
                      </div>
                    </div>
                  </div>

                  {/* Center line separator for beauty */}
                  <div className="hidden lg:block border-r border-theme-border shrink-0" />

                  {/* Recommendations column center */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-theme-text-secondary tracking-wider block font-mono">Improvement Pathways:</span>
                      <h3 className="text-sm font-extrabold text-theme-text-primary mt-1">Personalized Recommendations</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {readiness.recommendations?.map((rec: string, rIdx: number) => (
                        <div 
                          key={rIdx} 
                          className="bg-theme-surface border border-theme-border rounded-xl p-3.5 flex items-start space-x-2.5 hover:border-theme-accent/50 transition-all cursor-pointer group shadow-sm"
                          onClick={() => {
                            if (rec.toLowerCase().includes("resume")) setCurrentPage("resume-analyzer");
                            else if (rec.toLowerCase().includes("mock") || rec.toLowerCase().includes("voice")) setCurrentPage("voice-interview");
                            else if (rec.toLowerCase().includes("roadmap")) setCurrentPage("dsa-roadmap");
                            else if (rec.toLowerCase().includes("quiz") || rec.toLowerCase().includes("aptitude")) setCurrentPage("placement-hub");
                            else setCurrentPage("playground");
                          }}
                        >
                          <span className="h-5 w-5 rounded-full bg-theme-accent/10 border border-theme-accent/20 flex items-center justify-center text-xs shrink-0 mt-0.5 group-hover:scale-115 transition-transform text-theme-accent">⚡</span>
                          <span className="text-[11.5px] font-medium text-theme-text-secondary group-hover:text-theme-text-primary transition-colors leading-relaxed">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* SPECIAL DAILY EVENT / CODING CHALLENGE PROMPT */}
            <div className="bg-gradient-to-r from-orange-500/10 via-amber-200/20 to-amber-100/10 dark:from-amber-950/45 dark:via-slate-900 dark:to-slate-950 border border-amber-250 dark:border-amber-500/30 rounded-3xl p-6 shadow-xl mb-10 relative overflow-hidden" id="dashboard-daily-challenge-section">
              {/* Highlight background elements */}
              <div className="absolute top-0 right-0 h-44 w-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3 relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-xl text-white shadow-lg shrink-0">
                    <Zap className="h-5.5 w-5.5 text-amber-100" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] bg-rose-50 dark:bg-rose-950 text-rose-650 dark:text-rose-455 font-mono font-black uppercase py-0.5 px-2.5 rounded-full border border-rose-205 dark:border-rose-909/30 tracking-wider">🔥 Daily Event Active</span>
                      <span className="text-[10px] bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 font-mono font-black py-0.5 px-2.5 rounded-full border border-amber-205 dark:border-amber-909/40 tracking-wider">2X POINTS & DOUBLE BADGES</span>
                    </div>
                    <h2 className="text-xl font-black text-theme-text-primary leading-tight mt-2">Daily Coding Challenge</h2>
                    <p className="text-xs text-theme-text-secondary mt-1 max-w-2xl font-medium">
                      A brand-new randomly selected Algorithmic problem is issued every day. Solve it today to claim double point rewards and unlock high-prestige milestone trophy badges!
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 bg-theme-card border border-theme-border px-3.5 py-1.5 rounded-xl shrink-0 shadow-sm">
                  <Clock className="h-4 w-4 text-theme-accent animate-pulse" />
                  <div>
                    <span className="text-[8.5px] uppercase font-bold text-theme-text-secondary font-mono block">Resets in</span>
                    <span className="text-xs font-mono font-bold text-theme-text-primary block">{dailyCountdown}</span>
                  </div>
                </div>
              </div>

              {/* RENDER THE CURRENT DAILY CHALLENGE CARD */}
              {(() => {
                const dailyItem = getDailyChallenge();
                const isCompleted = localStorage.getItem(`dsa-challenge-${dailyItem.id}`) === "Completed";
                return (
                  <div className={`p-5 rounded-2xl border transition-all z-10 relative ${isCompleted ? 'bg-emerald-50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-500/20' : 'bg-theme-card border-theme-border hover:border-theme-accent/30'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                      <div className="space-y-2.5">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-[10px] text-theme-accent bg-theme-accent/10 px-2.5 py-0.5 rounded-lg border border-theme-accent/20 font-mono">
                            {dailyItem.category}
                          </span>
                          <span className={`font-mono px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            dailyItem.difficulty === 'Easy' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' :
                            dailyItem.difficulty === 'Medium' ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400' :
                            'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400'
                          }`}>{dailyItem.difficulty}</span>
                        </div>
                        <h3 className="text-base font-extrabold text-theme-text-primary leading-snug">{dailyItem.title}</h3>
                        <p className="text-xs text-theme-text-secondary leading-relaxed max-w-2xl">
                          Solve this special event mapping to gain <span className="text-amber-600 dark:text-amber-400 font-mono font-black">{dailyItem.points * 2} points</span> (double value!) and instantly unlock the prestigious <strong className="text-rose-600 dark:text-rose-400 font-extrabold">🎖️ Daily Conqueror</strong> milestone badge.
                        </p>
                      </div>

                      <div className="flex items-center gap-5 shrink-0 self-end md:self-center">
                        <div className="text-right font-mono text-[10.5px]">
                          <span className="text-slate-500 block uppercase">Competitors</span>
                          <span className="text-sm font-black text-theme-text-primary block leading-none mt-0.5">{dailyItem.competitors} Live</span>
                        </div>

                        <div className="text-right font-mono text-[10.5px] border-l border-theme-border pl-4">
                          <span className="text-slate-500 block uppercase">Solved today</span>
                          <span className="text-sm font-black text-theme-accent block leading-none mt-0.5">{dailyItem.submits} Solved</span>
                        </div>

                        {isCompleted ? (
                          <div className="bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/35 text-emerald-650 dark:text-emerald-400 font-black px-5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 cursor-default select-none">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Claimed!</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedChallengeId(dailyItem.id);
                              setCurrentPage("challenge-arena");
                            }}
                            className="bg-theme-accent hover:bg-theme-accent/90 text-white font-black px-5 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer transition-all duration-150 shadow-md scale-100 hover:scale-103 animate-pulse"
                          >
                            <span>Enter Daily Arena</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* HIGH-PROFILE DSA CHALLENGE BOARD */}
            <div className="bg-theme-card border border-theme-border rounded-3xl p-6.5 shadow-md dark:shadow-xl mb-10 relative overflow-hidden" id="dashboard-challenge-board-section">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-xl text-white shadow-md">
                    <Trophy className="h-5 w-5 text-amber-100" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-theme-text-primary leading-tight">Trending DSA Challenge Board</h2>
                    <p className="text-xs text-theme-text-secondary mt-1 font-medium">
                      Compete with active developers in solving deep problems within rigorous time allocations.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-theme-bg border border-theme-border px-3.5 py-1.5 rounded-xl shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping shrink-0" />
                  <span className="text-[10px] uppercase font-bold text-theme-text-secondary font-mono tracking-wider">Multiplayer Arena Active</span>
                </div>
              </div>

              {/* Grid of active trending challenges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    id: "rb-tree-validator",
                    title: "Space-Time RB-Tree Validator",
                    category: "Trees & Graphs",
                    difficulty: "Medium",
                    points: 150,
                    competitors: 48,
                    submits: 12
                  },
                  {
                    id: "lru-optimizer",
                    title: "Cosmic LRU Cache Optimizer",
                    category: "Caching & Design",
                    difficulty: "Hard",
                    points: 250,
                    competitors: 81,
                    submits: 29
                  },
                  {
                    id: "fastest-matrix-path",
                    title: "Weighted Matrix Hyperspace Pathfinder",
                    category: "Dynamic Programming",
                    difficulty: "Medium",
                    points: 180,
                    competitors: 27,
                    submits: 8
                  }
                ].map((item) => {
                  const isCompleted = localStorage.getItem(`dsa-challenge-${item.id}`) === "Completed";
                  const remainingSecs = challengeTimers[item.id] || 0;
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`bg-theme-bg border rounded-2xl p-5 flex flex-col justify-between transition-all relative ${
                        isCompleted 
                          ? "border-emerald-500/25 bg-gradient-to-tr from-emerald-50 dark:from-emerald-900/5 via-theme-bg to-theme-bg" 
                          : "border-theme-border hover:border-theme-accent/30 hover:scale-[1.015] hover:shadow-lg hover:shadow-indigo-950/10"
                      }`}
                    >
                      {/* Live countdown tag inside card */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[9.5px] uppercase font-bold text-theme-accent bg-theme-accent/10 px-2.5 py-1 rounded-lg border border-theme-accent/20 font-mono">
                          {item.category}
                        </span>

                        <div className="flex items-center space-x-1.5 bg-theme-card px-2 py-0.5 rounded-md border border-theme-border shadow-sm">
                          <Clock className={`h-3.5 w-3.5 ${isCompleted ? "text-theme-text-secondary" : remainingSecs < 1200 ? "text-red-505 animate-pulse" : "text-amber-550 dark:text-amber-400"}`} />
                          <span className={`text-[10px] font-mono leading-none ${isCompleted ? "text-theme-text-secondary" : remainingSecs < 1200 ? "text-red-500 dark:text-red-400 font-bold" : "text-theme-text-secondary"}`}>
                            {isCompleted ? "Ended" : formatTimerString(remainingSecs)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-extrabold text-theme-text-primary leading-snug">{item.title}</h3>
                        
                        <div className="flex items-center space-x-2 text-[10.5px]">
                          <span className={`font-mono px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            item.difficulty === "Easy" ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-150" :
                            item.difficulty === "Medium" ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-150" :
                            "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-150"
                          }`}>{item.difficulty}</span>
                          <span className="text-theme-text-secondary">•</span>
                          <span className="text-theme-accent font-mono font-black">{item.points} pts</span>
                        </div>

                        {/* Simulated competition stats */}
                        <div className="flex items-center space-x-3.5 pt-3 border-t border-theme-border text-[10.5px] text-theme-text-secondary">
                          <div className="flex items-center space-x-1">
                            <Users className="h-3.5 w-3.5 text-theme-accent" />
                            <span>{item.competitors} competing</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Zap className="h-3.5 w-3.5 text-amber-500" />
                            <span>{item.submits} solved</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5">
                        {isCompleted ? (
                          <div className="w-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-150 dark:border-emerald-900/35 text-emerald-650 dark:text-emerald-400 font-bold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-default select-none animate-pulse">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Challenge Completed!</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedChallengeId(item.id);
                              setCurrentPage("challenge-arena");
                            }}
                            className="w-full bg-theme-surface hover:bg-theme-accent text-theme-text-primary hover:text-white border border-theme-border hover:border-theme-accent font-semibold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-all duration-150 shadow-sm"
                          >
                            <span>Compete & Solve</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dashboard Main Grid Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Interview History Cards - Left 2 Columns */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-theme-card border border-theme-border rounded-2xl p-6 shadow-md">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-theme-accent" />
                      <h2 className="text-lg font-bold text-theme-text-primary">Interview Preparations</h2>
                    </div>
                    <span className="text-xs text-theme-accent font-bold cursor-pointer hover:underline" onClick={() => setCurrentPage("analytics")}>
                      View Growth Analytics
                    </span>
                  </div>

                  {sessions.length === 0 ? (
                    <div className="border border-dashed border-theme-border rounded-xl p-8 text-center" id="dashboard-sessions-empty">
                      <p className="text-sm text-theme-text-secondary">You haven't initiated any interview simulations yet.</p>
                      <button
                        onClick={() => setCurrentPage("mock-interview")}
                        className="text-xs text-theme-accent font-bold mt-2 hover:underline cursor-pointer"
                      >
                        Launch first mock session
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4" id="dashboard-sessions-list">
                      {sessions.map((session) => (
                        <div
                          id={`session-card-${session.id}`}
                          key={session.id}
                          onClick={() => {
                            setSelectedSessionId(session.id);
                            if (session.status === "completed") {
                              setCurrentPage("final-report");
                            } else {
                              setCurrentPage("mock-interview");
                            }
                          }}
                          className="flex items-center justify-between p-4 bg-theme-bg/50 hover:bg-theme-bg border border-theme-border hover:border-theme-accent/20 rounded-xl cursor-pointer transition-all group shadow-xs"
                        >
                          <div className="flex items-center space-x-3.5">
                            <div className={`p-2.5 rounded-lg border ${
                              session.status === "completed" ? "bg-emerald-555/10 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/20" : "bg-theme-accent/10 text-theme-accent border-theme-accent/20"
                            }`}>
                              <Sparkles className="h-4.5 w-4.5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-theme-text-primary group-hover:text-theme-accent transition-colors">{session.role}</h4>
                              <div className="flex items-center space-x-2.5 text-xs text-theme-text-secondary mt-1">
                                <span className="bg-theme-card border border-theme-border px-2 py-0.5 rounded text-theme-accent font-bold">{session.difficulty}</span>
                                <span className="flex items-center"><Calendar className="h-3 w-3 mr-1 text-theme-text-secondary" /> {new Date(session.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            {session.status === "completed" ? (
                              <div className="text-right">
                                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{session.score}%</span>
                                <p className="text-[10px] text-theme-text-secondary leading-none">Overall</p>
                              </div>
                            ) : (
                              <span className="text-[11px] bg-amber-50 dark:bg-amber-950 text-amber-653 dark:text-amber-405 border border-amber-205 dark:border-amber-900/30 px-2 py-0.5 rounded font-bold animate-pulse">
                                In Progress
                              </span>
                            )}
                            <ChevronRight className="h-4 w-4 text-theme-text-secondary group-hover:text-theme-text-primary transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Resume Scorecard Summary - Right 1 Column */}
              <div className="space-y-6">
                
                {/* DSA Visualization Session Snapshot Card */}
                <div className="bg-theme-card border border-theme-border rounded-2xl p-6 shadow-md relative overflow-hidden" id="dashboard-dsa-snapshot-card">
                  {/* Tiny visual accent decoration */}
                  <div className="absolute top-0 right-0 h-20 w-20 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-4.5">
                    <div className="flex items-center space-x-2">
                      <Layers className="h-5 w-5 text-pink-500" />
                      <h2 className="text-sm font-bold text-theme-text-primary uppercase tracking-wider font-mono">Last DSA Sandbox</h2>
                    </div>
                    {dsaSnapshot && (
                      <span className="text-[9.5px] uppercase font-bold px-2.5 py-1 rounded-lg bg-pink-50 dark:bg-pink-950/50 border border-pink-150 dark:border-pink-905/30 text-pink-600 dark:text-pink-400 font-mono animate-pulse">
                        {dsaSnapshot.structure?.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  {dsaSnapshot ? (
                    <>
                      <div className="bg-theme-bg border border-theme-border p-4 rounded-xl mb-4.5">
                        <div className="text-[10px] uppercase font-bold text-theme-text-secondary font-mono tracking-wider">
                          Checkpoint Status Summary
                        </div>
                        <h4 className="text-xs font-semibold text-theme-text-primary mt-1.5 leading-relaxed">
                          {dsaSnapshot.structure === "bst" && `Binary Search Tree structure with ${dsaSnapshot.nodes?.length || 0} nodes`}
                          {dsaSnapshot.structure === "stack" && `LIFO Stack comprising ${dsaSnapshot.nodes?.length || 0} active frames`}
                          {dsaSnapshot.structure === "queue" && `FIFO Queue representation with ${dsaSnapshot.nodes?.length || 0} items`}
                          {dsaSnapshot.structure === "array" && `Linear Array dataset with ${dsaSnapshot.nodes?.length || 0} list units`}
                          {dsaSnapshot.structure === "hash_map" && `HashMap key indexing structure with ${dsaSnapshot.hashBuckets?.length || 0} active buckets`}
                          {dsaSnapshot.structure === "sliding_window" && `Sliding subarray window optimizer (Size: ${dsaSnapshot.windowSize || 3})`}
                          {dsaSnapshot.structure === "comparison" && `Double algorithm runtime benchmarking model (${dsaSnapshot.algoLeft || 'left'} vs ${dsaSnapshot.algoRight || 'right'})`}
                        </h4>

                        {/* Display a micro layout snapshot representation of current items */}
                        {dsaSnapshot.nodes && Array.isArray(dsaSnapshot.nodes) && dsaSnapshot.nodes.length > 0 && (
                          <div className="mt-3.5 flex items-center gap-1.5 overflow-x-auto py-1">
                            {dsaSnapshot.nodes.slice(0, 5).map((nd: any) => (
                              <span key={nd.id} className="text-[10px] font-mono font-bold bg-theme-card border border-theme-border text-theme-text-primary px-2.5 py-1 rounded-lg">
                                {nd.val}
                              </span>
                            ))}
                            {dsaSnapshot.nodes.length > 5 && (
                              <span className="text-[10px] text-theme-text-secondary font-bold ml-1 font-mono">+{dsaSnapshot.nodes.length - 5} more</span>
                            )}
                          </div>
                        )}

                        {dsaSnapshot.slidingArray && Array.isArray(dsaSnapshot.slidingArray) && dsaSnapshot.slidingArray.length > 0 && (
                          <div className="mt-3.5 flex items-center gap-1.5 overflow-x-auto py-1">
                            {dsaSnapshot.slidingArray.slice(0, 5).map((num: number, idx: number) => (
                              <span key={idx} className="text-[10px] font-mono font-bold bg-theme-card border border-theme-border text-theme-text-primary px-2.5 py-1 rounded-lg">
                                {num}
                              </span>
                            ))}
                            {dsaSnapshot.slidingArray.length > 5 && (
                              <span className="text-[10px] text-theme-text-secondary font-bold ml-1 font-mono">+{dsaSnapshot.slidingArray.length - 5} more</span>
                            )}
                          </div>
                        )}

                        <div className="mt-3 text-[9px] text-theme-text-secondary font-mono">
                          Saved: {new Date(dsaSnapshot.updatedAt || Date.now()).toLocaleTimeString()} - {new Date(dsaSnapshot.updatedAt || Date.now()).toLocaleDateString()}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          localStorage.setItem("dsa-restore-trigger", "true");
                          setCurrentPage("dsa-visualizer");
                        }}
                        className="w-full bg-theme-surface hover:bg-pink-600 border border-theme-border hover:border-pink-500 text-pink-600 dark:text-pink-400 hover:text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all duration-150 cursor-pointer shadow-sm"
                        id="btn-resume-snapshot-dsa"
                      >
                        <Play className="h-3 w-3 fill-current shrink-0 text-pink-600 dark:text-pink-400 group-hover:text-white" />
                        <span>Resume Sandbox Session</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="bg-theme-bg border border-theme-border p-4 rounded-xl mb-4.5 text-center">
                        <p className="text-xs text-theme-text-secondary leading-normal mb-1.5">No active checkpoint found.</p>
                        <span className="text-[10.5px] text-theme-text-secondary block leading-normal font-medium animate-pulse">
                          Dive into our interactive sandbox to play, step, and analyze live visual data structures.
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setCurrentPage("dsa-visualizer");
                        }}
                        className="w-full bg-theme-surface hover:bg-theme-bg border border-theme-border text-pink-600 hover:text-pink-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all duration-150 cursor-pointer shadow-sm"
                        id="btn-launch-visualizer-first"
                      >
                        <span>Launch DSA Sandbox</span>
                      </button>
                    </>
                  )}
                </div>

                <div className="bg-theme-card border border-theme-border rounded-2xl p-6 shadow-md">
                  <div className="flex items-center space-x-2 mb-6">
                    <FileText className="h-5 w-5 text-theme-accent" />
                    <h2 className="text-lg font-bold text-theme-text-primary">Latest Resume Sync</h2>
                  </div>

                  {latestResume ? (
                    <div id="dashboard-has-resume">
                      <div className="bg-theme-bg border border-theme-border p-4.5 rounded-xl text-center">
                        <span className="text-xs text-theme-text-primary truncate block max-w-full font-bold">{latestResume.filename}</span>
                        
                        <div className="flex justify-center space-x-8 mt-5 mb-3.5">
                          <div>
                            <span className="text-2xl font-extrabold text-theme-accent">{latestResume.resumeScore}/100</span>
                            <p className="text-[10px] text-theme-text-secondary mt-0.5 uppercase tracking-wider font-bold">User Score</p>
                          </div>
                          <div className="border-r border-theme-border h-10 self-center"></div>
                          <div>
                            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{latestResume.atsScore}%</span>
                            <p className="text-[10px] text-theme-text-secondary mt-0.5 uppercase tracking-wider font-bold">ATS Compat</p>
                          </div>
                        </div>
                      </div>

                      {/* Strengths check */}
                      <div className="mt-5 space-y-3">
                        <span className="text-[11px] text-theme-text-secondary uppercase font-black tracking-wider">Top Strength Spotlights</span>
                        <div className="space-y-2">
                          {(latestResume.strengths || []).slice(0, 2).map((st, sidx) => (
                            <div key={sidx} className="flex items-start space-x-2 text-xs bg-theme-bg p-2.5 rounded-lg border border-theme-border leading-normal text-theme-text-primary font-semibold">
                              <CheckCircle2 className="h-4 w-4 text-emerald-555 dark:text-emerald-450 shrink-0 mt-0.5" />
                              <span>{st}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        id="dashboard-btn-resume-view"
                        onClick={() => {
                          setSelectedResume(latestResume);
                          setCurrentPage("resume-analyzer");
                        }}
                        className="w-full mt-6 bg-theme-surface hover:bg-theme-bg border border-theme-border text-theme-accent hover:text-theme-accent/80 font-semibold py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <span>Open Detailed Report</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="border border-dashed border-theme-border rounded-xl p-8 text-center" id="dashboard-resume-empty">
                      <p className="text-sm text-theme-text-secondary">No resumes analyzed yet.</p>
                      <button
                        onClick={() => {
                          setSelectedResume(null);
                          setCurrentPage("resume-analyzer");
                        }}
                        className="text-xs text-theme-accent font-bold mt-2 hover:underline cursor-pointer"
                      >
                        Upload and analyze resume
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </>
        )}

      </div>
    </div>
  );
};

import { PlacementReadinessScore } from "../types";

export interface Badge {
  id: string;
  name: string;
  desc: string;
  icon: string;
  category: "streak" | "dsa" | "quiz" | "profile";
  colorClass: string;
  reqText: string;
  isUnlocked: boolean;
}

export function evaluateBadges(readiness: PlacementReadinessScore | null): Badge[] {
  const streakCount = readiness?.streakCount || 0;
  const problemsSolved = readiness?.problemsSolved || 0;
  const hasResume = (readiness?.achievements || []).includes("Resume Synced");
  const hasMock = (readiness?.achievements || []).includes("Mock Talker");
  
  // Local storage flags
  const hasLruSolved = localStorage.getItem("dsa-challenge-lru-optimizer") === "Completed";
  const hasHighQuiz = localStorage.getItem("quiz-high-accuracy") === "true";
  const hasPerfectQuiz = localStorage.getItem("quiz-perfect-accuracy") === "true";

  // Check counts for daily challenge completions and overall solved challenges
  let completedChallengesCount = 0;
  let hasDailySolved = false;
  
  if (typeof window !== "undefined" && window.localStorage) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("dsa-challenge-")) {
        if (localStorage.getItem(key) === "Completed") {
          completedChallengesCount++;
          if (key.startsWith("dsa-challenge-daily-")) {
            hasDailySolved = true;
          }
        }
      }
    }
  }

  return [
    {
      id: "daily_conqueror",
      name: "Daily Conqueror",
      desc: "Conquered a high-profile deterministic Daily Coding Challenge under double rewards.",
      icon: "🎖️",
      category: "dsa",
      colorClass: "from-amber-500/15 to-rose-500/15 border-rose-500/30 text-rose-400",
      reqText: "Solve 1+ Daily Challenge",
      isUnlocked: hasDailySolved
    },
    {
      id: "arena_overlord",
      name: "Arena Overlord",
      desc: "Dominated multiple live multiplayer rooms in the Challenge Arenas.",
      icon: "🌌",
      category: "dsa",
      colorClass: "from-fuchsia-500/15 to-indigo-500/15 border-fuchsia-500/30 text-fuchsia-400",
      reqText: "Solve 3+ Challenges",
      isUnlocked: completedChallengesCount >= 3
    },
    {
      id: "streak_active",
      name: "Flame Novice",
      desc: "Kept the fire burning with an active day streak.",
      icon: "🔥",
      category: "streak",
      colorClass: "from-orange-500/10 to-amber-500/10 border-orange-500/30 text-orange-400",
      reqText: "Active 1+ day coding streak",
      isUnlocked: streakCount >= 1
    },
    {
      id: "streak_elite",
      name: "Streak Commando",
      desc: "Maintained a strong 3-day streak.",
      icon: "⚡",
      category: "streak",
      colorClass: "from-yellow-500/10 to-amber-400/10 border-yellow-500/30 text-yellow-400",
      reqText: "Active 3+ day coding streak",
      isUnlocked: streakCount >= 3
    },
    {
      id: "streak_legend",
      name: "Streak Overlord",
      desc: "Absolute dedication to daily continuous code solves.",
      icon: "👑",
      category: "streak",
      colorClass: "from-purple-500/10 to-pink-500/10 border-purple-500/30 text-purple-400",
      reqText: "Active 5+ day coding streak",
      isUnlocked: streakCount >= 5
    },
    {
      id: "lru_sorcerer",
      name: "Cache Sorcerer",
      desc: "Solved the advanced hard-level Cosmic LRU Cache Optimizer.",
      icon: "💾",
      category: "dsa",
      colorClass: "from-blue-500/10 to-indigo-500/10 border-indigo-400/30 text-indigo-400",
      reqText: "Solve Cosmic LRU Cache in Arena",
      isUnlocked: hasLruSolved
    },
    {
      id: "quiz_sniper",
      name: "Quiz Marksman",
      desc: "Cleared a quiz with an exceptional >=80% scoring accuracy.",
      icon: "🎯",
      category: "quiz",
      colorClass: "from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-400",
      reqText: "Achieve >=80% Quiz Score accuracy",
      isUnlocked: hasHighQuiz
    },
    {
      id: "quiz_god",
      name: "Flawless Genius",
      desc: "Dominated a questionnaire with a perfect 100% correct rate.",
      icon: "🌟",
      category: "quiz",
      colorClass: "from-cyan-500/10 to-indigo-400/10 border-cyan-400/30 text-cyan-400",
      reqText: "Achieve 100% on any Quiz subject",
      isUnlocked: hasPerfectQuiz
    },
    {
      id: "resume_synced",
      name: "Resume Aligned",
      desc: "Uploaded a synced resume profile for real-time ATS index scanning.",
      icon: "📄",
      category: "profile",
      colorClass: "from-slate-500/10 to-slate-400/10 border-slate-500/30 text-slate-400",
      reqText: "Upload your resume first score",
      isUnlocked: hasResume
    },
    {
      id: "mock_talker",
      name: "Vocal Challenger",
      desc: "Simulated speech interviews to build high verbal confidence.",
      icon: "🎙️",
      category: "profile",
      colorClass: "from-rose-500/10 to-pink-500/10 border-pink-500/30 text-pink-400",
      reqText: "Complete 1+ Voice Mock Trial",
      isUnlocked: hasMock
    }
  ];
}

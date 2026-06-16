import React, { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  BarChart3, 
  Code, 
  Map, 
  Eye, 
  FileCheck2, 
  Flame, 
  Mic, 
  GraduationCap, 
  Award,
  Trophy,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { evaluateBadges } from "../data/badges";
import { PlacementReadinessScore } from "../types";

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  setCurrentPage, 
  onCloseMobile 
}) => {
  const { user } = useAuth();
  const [readiness, setReadiness] = useState<PlacementReadinessScore | null>(null);

  // Fetch readiness so we can render actual Unlocked Badges count & Streak right inside the sidebar!
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
            console.warn("Sidebar readiness response was not JSON:", contentType);
          }
        }
      } catch (err) {
        console.error("Failed to load readiness in sidebar", err);
      }
    };
    fetchReadiness();
  }, [currentPage]); // re-fetch on page transitions to keep badges reactive!

  const badges = evaluateBadges(readiness);
  const unlockedCount = badges.filter(b => b.isUnlocked).length;
  const activeStreak = readiness?.streakCount || 0;

  const mainNavItems = [
    { id: "dashboard", label: "Dashboard", desc: "Main preparation hub", icon: LayoutDashboard },
    { id: "resume-analyzer", label: "Resume Analyzer", desc: "ATS keyword sync", icon: FileText },
    { id: "mock-interview", label: "Mock Interview", desc: "Full conversation", icon: Briefcase },
    { id: "analytics", label: "Growth Analytics", desc: "Preparation scorecard", icon: BarChart3 },
  ];

  const prepArenaItems = [
    { id: "playground", label: "Coding Playground", desc: "Custom node executor", icon: Code },
    { id: "dsa-roadmap", label: "DSA Roadmap", desc: "Curated learning paths", icon: Map },
    { id: "dsa-visualizer", label: "Structures Visualizer", desc: "LIFO/FIFO queue trace", icon: Eye },
    { id: "coding-sheet", label: "Blind 75 Sheet", desc: "Elite coding checkpoints", icon: FileCheck2 },
    { id: "daily-tracker", label: "Daily Tracker & Streak", desc: "Continuous solutions", icon: Flame },
    { id: "voice-interview", label: "AI Voice Mock", desc: "Audio feedback loop", icon: Mic },
    { id: "placement-hub", label: "Placement Prep Hub", desc: "Academic MCQ checkpoint", icon: GraduationCap },
  ];

  const handleNavigate = (pageId: string) => {
    setCurrentPage(pageId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-theme-surface border-r border-theme-border text-theme-text-primary select-none font-sans" id="app-sidebar-component">
      
      {/* Scrollable Nav Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7 scrollbar-thin">
        
        {/* Profile Card Summary */}
        {user && (
          <div className="bg-theme-bg p-4 rounded-2xl border border-theme-border flex items-center space-x-3" id="sidebar-profile-capsule">
            <div className="w-9 h-9 rounded-xl bg-theme-accent border border-theme-accent/30 flex items-center justify-center font-black text-white shrink-0 shadow-md">
              {user.name[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-black block tracking-tight truncate text-theme-text-primary leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] text-theme-text-secondary uppercase font-bold tracking-wider leading-none block mt-0.5 font-mono">
                Candidate Member
              </span>
            </div>
          </div>
        )}

        {/* Categories: Main Sections */}
        <div className="space-y-2">
          <span className="text-[10px] text-theme-text-secondary font-extrabold uppercase tracking-widest block pl-3 font-mono">
            Main Hub
          </span>
          <div className="space-y-1">
            {mainNavItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    isActive 
                      ? "bg-theme-accent border-theme-accent text-white shadow-lg shadow-theme-accent/15" 
                      : "bg-transparent border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg"
                  }`}
                  id={`sidebar-link-${item.id}`}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-white" : "text-theme-accent"}`} />
                  <div>
                    <span className="text-xs font-bold block leading-none">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories: Prep Arena */}
        <div className="space-y-2">
          <span className="text-[10px] text-theme-text-secondary font-extrabold uppercase tracking-widest block pl-3 font-mono">
            Prep Arena Features
          </span>
          <div className="space-y-1">
            {prepArenaItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    isActive 
                      ? "bg-theme-accent border-theme-accent text-white shadow-lg shadow-theme-accent/15" 
                      : "bg-transparent border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg"
                  }`}
                  id={`sidebar-link-${item.id}`}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-white" : "text-theme-accent"}`} />
                  <div>
                     <span className="text-xs font-bold block leading-none">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Admin Navigation */}
        {user?.isAdmin && (
          <div className="pt-2">
            <button
              onClick={() => handleNavigate("admin")}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                currentPage === "admin"
                  ? "bg-theme-accent border-theme-accent text-white shadow-md"
                  : "bg-transparent border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg"
              }`}
            >
              <ShieldCheck className="h-4.5 w-4.5 text-theme-accent shrink-0" />
              <span className="text-xs font-bold block leading-none">Admin Area</span>
            </button>
          </div>
        )}

      </div>

      {/* Gamified Score indicators at the bottom */}
      <div className="p-4 border-t border-theme-border bg-theme-bg/50 font-mono space-y-3" id="sidebar-reward-indicators">
        
        {/* Streak indicator */}
        <div className="flex items-center justify-between text-xs bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/10 p-2.5 rounded-xl">
          <div className="flex items-center space-x-2">
            <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
            <span className="text-[10px] text-theme-text-secondary font-extrabold uppercase">Daily Streak:</span>
          </div>
          <span className="font-extrabold text-amber-650 dark:text-amber-400">{activeStreak} Days</span>
        </div>

        <p className="text-[9px] text-theme-text-secondary text-center uppercase tracking-wider font-extrabold leading-none pb-1">
          InterviewAce AI © 2026
        </p>
      </div>

    </div>
  );
};

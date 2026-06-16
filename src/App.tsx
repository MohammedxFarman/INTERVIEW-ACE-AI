/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { Dashboard } from "./components/Dashboard";
import { ResumeAnalyzer } from "./components/ResumeAnalyzer";
import { MockInterview } from "./components/MockInterview";
import { FinalReport } from "./components/FinalReport";
import { Analytics } from "./components/Analytics";
import { AdminPanel } from "./components/AdminPanel";
import { CodingPlayground } from "./components/CodingPlayground";
import { DsaRoadmap } from "./components/DsaRoadmap";
import { DsaVisualizer } from "./components/DsaVisualizer";
import { CodingSheet } from "./components/CodingSheet";
import { DailyTracker } from "./components/DailyTracker";
import { VoiceInterview } from "./components/VoiceInterview";
import { PlacementPrepHub } from "./components/PlacementPrepHub";
import { ChallengeArena } from "./components/ChallengeArena";
import { Resume } from "./types";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Custom SPA Routing mechanism targeting maximum stability and reactive transitions
  const [currentPage, setCurrentPage] = useState<string>("landing");

  // Router Page Transition Progress States
  const [navigationProgress, setNavigationProgress] = useState<number>(0);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  useEffect(() => {
    setIsNavigating(true);
    setNavigationProgress(15);
    
    const t1 = setTimeout(() => setNavigationProgress(45), 80);
    const t2 = setTimeout(() => setNavigationProgress(75), 200);
    const t3 = setTimeout(() => setNavigationProgress(90), 380);
    const t4 = setTimeout(() => setNavigationProgress(100), 520);
    const t5 = setTimeout(() => {
      setIsNavigating(false);
      setNavigationProgress(0);
    }, 700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [currentPage]);
  
  // Shared structural states
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [selectedProblemId, setSelectedProblemId] = useState<string>("two-sum");
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>("lru-optimizer");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Theme Switching Mechanism (Light, Dark, System)
  const [theme, setThemeState] = useState<"light" | "dark" | "system">(() => {
    return (localStorage.getItem("theme") as "light" | "dark" | "system") || "system";
  });

  const changeTheme = (newTheme: "light" | "dark" | "system") => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      let isDark = true;
      if (theme === "system") {
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      } else {
        isDark = theme === "dark";
      }

      if (isDark) {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
      }
    };

    applyTheme();

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => applyTheme();
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, [theme]);

  // Synchronize authenticated default routes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasShareId = params.has("share_id") || params.has("share");

    if (!isLoading) {
      if (isAuthenticated) {
        // If logged in and on authentication or splash views, redirect directly to user dashboard
        if (["landing", "login", "register"].includes(currentPage)) {
          if (hasShareId) {
            setCurrentPage("dsa-visualizer");
          } else {
            setCurrentPage("dashboard");
          }
        }
      } else {
        // If not logged in, allow visiting dsa-visualizer if they are accessing a shared session
        if (hasShareId) {
          if (currentPage !== "dsa-visualizer") {
            setCurrentPage("dsa-visualizer");
          }
        } else if (!["landing", "login", "register"].includes(currentPage)) {
          setCurrentPage("landing");
        }
      }
    }
  }, [isAuthenticated, isLoading, currentPage]);

  // Render components dynamically based on router state
  const renderPage = () => {
    switch (currentPage) {
      case "landing":
        return <LandingPage setCurrentPage={setCurrentPage} />;
      case "login":
        return <LoginPage setCurrentPage={setCurrentPage} />;
      case "register":
        return <RegisterPage setCurrentPage={setCurrentPage} />;
      case "dashboard":
        return (
          <Dashboard
            setCurrentPage={setCurrentPage}
            setSelectedSessionId={setSelectedSessionId}
            setSelectedResume={setSelectedResume}
            setSelectedChallengeId={setSelectedChallengeId}
          />
        );
      case "resume-analyzer":
        return (
          <ResumeAnalyzer
            setCurrentPage={setCurrentPage}
            selectedResume={selectedResume}
            setSelectedResume={setSelectedResume}
          />
        );
      case "mock-interview":
        return (
          <MockInterview
            setCurrentPage={setCurrentPage}
            selectedSessionId={selectedSessionId}
            setSelectedSessionId={setSelectedSessionId}
          />
        );
      case "final-report":
        return (
          <FinalReport
            setCurrentPage={setCurrentPage}
            selectedSessionId={selectedSessionId}
            setSelectedSessionId={setSelectedSessionId}
          />
        );
      case "analytics":
        return <Analytics setCurrentPage={setCurrentPage} />;
      case "admin":
        return <AdminPanel />;
      
      // NEW SENSATIONAL TRACKS ROTATIONS
      case "playground":
        return (
          <CodingPlayground 
            setCurrentPage={setCurrentPage} 
            initialProblemId={selectedProblemId}
          />
        );
      case "dsa-roadmap":
        return (
          <DsaRoadmap 
            setCurrentPage={setCurrentPage} 
            onSelectProblem={setSelectedProblemId}
          />
        );
      case "dsa-visualizer":
        return <DsaVisualizer setCurrentPage={setCurrentPage} />;
      case "coding-sheet":
        return (
          <CodingSheet 
            setCurrentPage={setCurrentPage} 
            onSelectProblem={setSelectedProblemId}
          />
        );
      case "daily-tracker":
        return (
          <DailyTracker 
            setCurrentPage={setCurrentPage} 
            onSelectProblem={setSelectedProblemId}
          />
        );
      case "voice-interview":
        return <VoiceInterview setCurrentPage={setCurrentPage} />;
      case "placement-hub":
        return <PlacementPrepHub setCurrentPage={setCurrentPage} />;
      case "challenge-arena":
        return (
          <ChallengeArena 
            setCurrentPage={setCurrentPage} 
            challengeId={selectedChallengeId} 
          />
        );
        
      default:
        return <LandingPage setCurrentPage={setCurrentPage} />;
    }
  };

  // Close mobile sidebar on page transition to keep navigation immediate and sleek
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPage]);

  const isInnerPage = !["landing", "login", "register"].includes(currentPage);

  if (isLoading) {
    return (
      <div className="bg-theme-bg min-h-screen flex flex-col items-center justify-center text-theme-text-secondary font-sans" id="app-initial-loader">
        <div className="animate-spin rounded-full h-11 w-11 border-b-2 border-theme-accent mb-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">Synchronizing secure session layers...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text-primary flex flex-col transition-colors duration-200">
      {/* Dynamic Global Page Transition Progress Bar */}
      {isNavigating && (
        <div 
          className="fixed top-0 left-0 right-0 h-[3px] bg-theme-border/30 z-[9999] transition-opacity duration-300"
          style={{ opacity: navigationProgress === 100 ? 0 : 1 }}
          id="global-router-progress-bar"
        >
          <div 
            className="h-full bg-theme-accent transition-all duration-300 ease-out shadow-[0_0_8px_rgba(99,102,241,0.6)]"
            style={{ width: `${navigationProgress}%` }}
          />
        </div>
      )}

      {/* Show Navbar on all states */}
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        theme={theme} 
        changeTheme={changeTheme} 
        onToggleMobileMenu={isInnerPage ? () => setIsMobileMenuOpen(!isMobileMenuOpen) : undefined}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      {isInnerPage && isAuthenticated ? (
        <div className="flex-1 flex overflow-hidden relative" id="app-horizontal-workspace">
          {/* Desktop Left Sidebar: elegant and persistent list of sections */}
          <aside className="hidden lg:block w-70 shrink-0 border-r border-theme-border bg-theme-surface h-[calc(100vh-65px)] sticky top-[65px]" id="desktop-sidebar-container">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
          </aside>

          {/* Mobile Overlay Sidebar Drawer via hamburger */}
          {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex" id="mobile-sidebar-overlay-wrapper">
              {/* Back backdrop blur */}
              <div 
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              
              {/* Sidebar Content drawer */}
              <div className="relative w-72 max-w-xs bg-theme-surface h-full shadow-2xl flex flex-col z-50 transform transition-transform duration-300">
                <div className="p-4 border-b border-theme-border flex justify-between items-center bg-theme-bg">
                  <span className="text-xs font-black text-theme-accent uppercase tracking-widest font-mono">Navigation Menu</span>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 px-2 text-xs font-bold text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg rounded-lg cursor-pointer"
                  >
                    Close ✕
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <Sidebar 
                    currentPage={currentPage} 
                    setCurrentPage={setCurrentPage} 
                    onCloseMobile={() => setIsMobileMenuOpen(false)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Active screen viewport wrapper */}
          <main className="flex-1 overflow-y-auto h-[calc(100vh-65px)] bg-theme-bg text-theme-text-primary" id="main-scrollable-workspace">
            {renderPage()}
          </main>
        </div>
      ) : (
        <main className="flex-1 text-theme-text-primary">
          {renderPage()}
        </main>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

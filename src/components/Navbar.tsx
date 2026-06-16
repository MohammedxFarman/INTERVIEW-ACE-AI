/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Briefcase, LayoutDashboard, FileText, BarChart3, ShieldCheck, LogOut, Award, Sun, Moon, Monitor, X, Menu, Wifi, WifiOff } from "lucide-react";

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  theme?: "light" | "dark" | "system";
  changeTheme?: (theme: "light" | "dark" | "system") => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentPage, 
  setCurrentPage, 
  theme = "system", 
  changeTheme,
  onToggleMobileMenu,
  isMobileMenuOpen
}) => {
  const { user, logout } = useAuth();
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <nav className="bg-theme-surface border-b border-theme-border text-theme-text-primary py-3 px-6 sticky top-0 z-50 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left corner: Mobile Hamburger Trigger & Logo */}
        <div className="flex items-center space-x-2">
          {user && onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg rounded-lg focus:outline-none cursor-pointer mr-1"
              id="mobile-nav-toggle-btn"
              title="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5.5 w-5.5 text-theme-accent" />
              ) : (
                <Menu className="h-5.5 w-5.5" />
              )}
            </button>
          )}

          <div 
            onClick={() => setCurrentPage("dashboard")} 
            className="flex items-center space-x-2 cursor-pointer group"
            id="nav-logo"
          >
            <div className="bg-gradient-to-tr from-theme-accent to-indigo-650 p-2 rounded-lg text-white shadow-md shadow-indigo-900/10 group-hover:scale-105 transition-transform duration-200">
              <Award className="h-5 w-5" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-theme-text-primary">
              InterviewAce <span className="text-theme-accent">AI</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs - Authenticated */}
        {user ? (
          <div className="hidden xl:flex items-center space-x-1" id="nav-tabs-container">
            <button
              id="btn-nav-dashboard"
              onClick={() => setCurrentPage("dashboard")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 border ${
                currentPage === "dashboard"
                  ? "bg-theme-accent/10 text-theme-accent border-theme-accent/20"
                  : "text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg border-transparent"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>

            <button
              id="btn-nav-resume"
              onClick={() => setCurrentPage("resume-analyzer")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 border ${
                currentPage === "resume-analyzer"
                  ? "bg-theme-accent/10 text-theme-accent border-theme-accent/20"
                  : "text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg border-transparent"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Resume Analyzer</span>
            </button>

            <button
              id="btn-nav-interview"
              onClick={() => setCurrentPage("mock-interview")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 border ${
                currentPage === "mock-interview"
                  ? "bg-theme-accent/10 text-theme-accent border-theme-accent/20"
                  : "text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg border-transparent"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Mock Interview</span>
            </button>

            <button
              id="btn-nav-analytics"
              onClick={() => setCurrentPage("analytics")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 border ${
                currentPage === "analytics"
                  ? "bg-theme-accent/10 text-theme-accent border-theme-accent/20"
                  : "text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg border-transparent"
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </button>

            {/* PREP ARENA MULTI-VIEW DROPDOWN */}
            <div className="relative group">
              <button
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-semibold text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg transition-all duration-150 cursor-pointer"
              >
                <span>Prep Arena</span>
                <span className="text-[10px] bg-theme-accent/10 text-theme-accent px-1.5 py-0.5 rounded font-bold uppercase tracking-wider scale-90">9+ Features</span>
              </button>

              {/* Hover Dropdown contents */}
              <div className="absolute right-0 top-full mt-1 w-56 bg-theme-card border border-theme-border rounded-2xl shadow-xl p-2.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 z-50 space-y-1">
                <button
                  onClick={() => setCurrentPage("playground")}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-theme-text-primary hover:text-theme-accent hover:bg-theme-bg block transition-all cursor-pointer"
                >
                  💻 Coding Playground
                </button>
                <button
                  onClick={() => setCurrentPage("dsa-roadmap")}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-theme-text-primary hover:text-theme-accent hover:bg-theme-bg block transition-all cursor-pointer"
                >
                  🗺️ DSA Roadmap & Tutor
                </button>
                <button
                  onClick={() => setCurrentPage("dsa-visualizer")}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-theme-text-primary hover:text-theme-accent hover:bg-theme-bg block transition-all cursor-pointer"
                >
                  👁️ Structures Visualizer
                </button>
                <button
                  onClick={() => setCurrentPage("coding-sheet")}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-theme-text-primary hover:text-theme-accent hover:bg-theme-bg block transition-all cursor-pointer"
                >
                  📑 Blind 75 Coding Sheet
                </button>
                <button
                  onClick={() => setCurrentPage("daily-tracker")}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-theme-text-primary hover:text-theme-accent hover:bg-theme-bg block transition-all cursor-pointer"
                >
                  🔥 Daily Practice Tracker
                </button>
                <button
                  onClick={() => setCurrentPage("voice-interview")}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-theme-text-primary hover:text-theme-accent hover:bg-theme-bg block transition-all cursor-pointer"
                >
                  🎙️ AI Voice Mock Interview
                </button>
                <button
                  onClick={() => setCurrentPage("placement-hub")}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-theme-text-primary hover:text-theme-accent hover:bg-theme-bg block transition-all cursor-pointer"
                >
                  🎯 Placement Prep Hub
                </button>
              </div>
            </div>

            {user.isAdmin && (
              <button
                id="btn-nav-admin"
                onClick={() => setCurrentPage("admin")}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 border ${
                  currentPage === "admin"
                    ? "bg-theme-accent/10 text-theme-accent border-theme-accent/20"
                    : "text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg border-transparent"
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Admin Stats</span>
              </button>
            )}
          </div>
        ) : null}

        {/* User Actions */}
        <div className="flex items-center space-x-3" id="nav-user-actions">
          {/* Network Connection Status Indicator */}
          {!isOnline ? (
            <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-900/40 text-orange-600 dark:text-orange-400 font-mono text-[10px] uppercase font-bold tracking-wide animate-pulse" id="connection-offline-indicator" title="Service Worker Offline Mode active">
              <WifiOff className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400" />
              <span>Offline</span>
            </div>
          ) : (
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/20 text-emerald-600 dark:text-emerald-450 font-mono text-[9px] uppercase font-bold tracking-wider select-none" id="connection-online-indicator">
              <Wifi className="h-3 w-3 text-emerald-500 dark:text-emerald-450" />
              <span>Synced & Secure</span>
            </div>
          )}

          {/* Light/Dark/System Theme Segmented Controller */}
          {changeTheme && (
            <div className="flex bg-theme-bg p-1 rounded-xl border border-theme-border space-x-1 select-none font-mono text-[9px] mr-1" id="theme-selector-group">
              <button
                onClick={() => changeTheme("light")}
                className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                  theme === "light"
                    ? "bg-theme-accent text-white shadow-sm"
                    : "text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg"
                }`}
                title="Light Theme"
                id="theme-light-btn"
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => changeTheme("dark")}
                className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                  theme === "dark"
                    ? "bg-theme-accent text-white shadow-sm"
                    : "text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg"
                }`}
                title="Dark Theme"
                id="theme-dark-btn"
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => changeTheme("system")}
                className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                  theme === "system"
                    ? "bg-theme-accent text-white shadow-sm"
                    : "text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg"
                }`}
                title="System Theme"
                id="theme-system-btn"
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {user ? (
            <>
              <div className="flex items-center space-x-2 bg-theme-bg border border-theme-border px-3 py-1.5 rounded-full select-none">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-semibold text-theme-text-primary max-w-[120px] truncate">
                  {user.name}
                </span>
              </div>
              <button
                id="btn-logout"
                onClick={logout}
                className="flex items-center space-x-1.5 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/30 text-red-650 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-700 dark:hover:text-red-250 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                id="btn-nav-login"
                onClick={() => setCurrentPage("login")}
                className="text-theme-text-secondary hover:text-theme-text-primary px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors duration-150"
              >
                Sign In
              </button>
              <button
                id="btn-nav-register"
                onClick={() => setCurrentPage("register")}
                className="bg-theme-accent hover:opacity-90 text-white px-4 py-1.5 rounded-lg text-sm font-semibold cursor-pointer shadow-sm transition-all duration-150"
              >
                Sign Up Free
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

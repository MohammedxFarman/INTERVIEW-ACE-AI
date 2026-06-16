/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ArrowRight, Globe, Shield, Sparkles, CheckCircle2, Award, Briefcase, FileSearch } from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  setCurrentPage: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setCurrentPage }) => {
  return (
    <div className="bg-theme-bg text-theme-text-primary min-h-screen font-sans selection:bg-theme-accent/30 overflow-x-hidden transition-colors duration-300">
      {/* Background Decorative Gradients - subtle on light mode, deep on dark mode */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[600px] pointer-events-none opacity-10 dark:opacity-20 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-theme-accent/40 via-purple-500/10 to-transparent blur-3xl z-0" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10" id="landing-hero-section">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center space-x-2 bg-theme-surface border border-theme-border rounded-full px-4 py-1.5 mb-6 text-xs text-theme-accent font-semibold shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5 animate-pulse text-theme-accent" />
          <span>Empowered by Gemini 3.5 Flash Model</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-theme-text-primary mb-6 leading-tight max-w-4xl"
        >
          Master Technical & HR Interviews with <span className="bg-gradient-to-r from-theme-accent via-purple-600 to-indigo-700 dark:from-theme-accent dark:via-purple-400 dark:to-indigo-500 bg-clip-text text-transparent">InterviewAce AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-md md:text-lg text-theme-text-secondary mb-10 max-w-2xl leading-relaxed font-medium"
        >
          Evaluate your resume, extract critical missing skills, and engage in realistic, conversational mock interviews with real-time feedback and structured learning paths.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md"
        >
          <button
            id="landing-cta-start"
            onClick={() => setCurrentPage("register")}
            className="w-full sm:w-auto bg-theme-accent hover:bg-theme-accent/90 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 text-md"
          >
            <span>Start Free Prep Now</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          <button
            id="landing-cta-demo"
            onClick={() => setCurrentPage("login")}
            className="w-full sm:w-auto bg-theme-surface border border-theme-border hover:bg-theme-bg hover:border-theme-border text-theme-text-primary font-semibold py-3 px-8 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 text-md shadow-sm"
          >
            <span>Sign In Account</span>
          </button>
        </motion.div>
      </section>

      {/* Trust Counters */}
      <section className="border-y border-theme-border bg-theme-surface/50 py-10 px-6 max-w-7xl mx-auto relative z-10 rounded-2xl shadow-sm backdrop-blur-sm" id="landing-stats-banner">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h4 className="text-3xl font-extrabold text-theme-text-primary">Gemini 3.5</h4>
            <p className="text-xs text-theme-text-secondary mt-1 uppercase font-semibold tracking-wider">Engine Power</p>
          </div>
          <div>
            <h4 className="text-3xl font-extrabold text-theme-text-primary">100%</h4>
            <p className="text-xs text-theme-text-secondary mt-1 uppercase font-semibold tracking-wider">ATS Compatible</p>
          </div>
          <div>
            <h4 className="text-3xl font-extrabold text-theme-text-primary">15+</h4>
            <p className="text-xs text-theme-text-secondary mt-1 uppercase font-semibold tracking-wider">Technical Roles</p>
          </div>
          <div>
            <h4 className="text-3xl font-extrabold text-theme-text-primary">Realtime</h4>
            <p className="text-xs text-theme-text-secondary mt-1 uppercase font-semibold tracking-wider">AI Scorecards</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto relative z-10" id="landing-features-section">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-theme-text-primary mb-4">Elite Tooling for Modern Candidates</h2>
          <p className="text-sm md:text-md text-theme-text-secondary max-w-2xl mx-auto">
            Recruiter-grade products designed to target core deficiencies and elevate your interview response quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-theme-surface border border-theme-border p-8 rounded-2xl flex flex-col justify-between group hover:border-theme-accent/50 hover:bg-theme-bg transition-all duration-300 shadow-sm hover:shadow-md">
            <div>
              <div className="bg-theme-accent/10 text-theme-accent p-3.5 rounded-xl w-fit mb-6 shadow-sm border border-theme-accent/20">
                <FileSearch className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-theme-text-primary mb-3">AI Resume Analyzer</h3>
              <p className="text-sm text-theme-text-secondary leading-relaxed">
                Upload your resume to extract keyword missing skills, identify formatting bottlenecks, and obtain an instant ATS readiness score.
              </p>
            </div>
            <ul className="text-xs text-theme-text-secondary mt-6 space-y-2.5 pt-6 border-t border-theme-border">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-theme-accent" />
                <span>Format & spacing optimization tips</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-theme-accent" />
                <span>Job-match keyword recommendations</span>
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="bg-theme-surface border border-theme-border p-8 rounded-2xl flex flex-col justify-between group hover:border-theme-accent/50 hover:bg-theme-bg transition-all duration-300 shadow-sm hover:shadow-md">
            <div>
              <div className="bg-purple-500/10 text-purple-500 p-3.5 rounded-xl w-fit mb-6 shadow-sm border border-purple-500/20">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-theme-text-primary mb-3">Conversational Mock AI</h3>
              <p className="text-sm text-theme-text-secondary leading-relaxed">
                Answer technical and soft-skill questions generated dynamically based on your target role (Software Engineer, Frontend / Backend, Data Analyst, etc.).
              </p>
            </div>
            <ul className="text-xs text-theme-text-secondary mt-6 space-y-2.5 pt-6 border-t border-theme-border">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-500" />
                <span>10 structured micro-evaluated stages</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-500" />
                <span>Instant ratings & correct wording tips</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="bg-theme-surface border border-theme-border p-8 rounded-2xl flex flex-col justify-between group hover:border-theme-accent/50 hover:bg-theme-bg transition-all duration-300 shadow-sm hover:shadow-md">
            <div>
              <div className="bg-emerald-500/10 text-emerald-500 p-3.5 rounded-xl w-fit mb-6 shadow-sm border border-emerald-500/20">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-theme-text-primary mb-3">Recruiter Scorecards</h3>
              <p className="text-sm text-theme-text-secondary leading-relaxed">
                Acquire high-fidelity summaries analyzing your technical syntax, communication fluency, response confidence, and localized roadmap pathing.
              </p>
            </div>
            <ul className="text-xs text-theme-text-secondary mt-6 space-y-2.5 pt-6 border-t border-theme-border">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Aggregate ratings charts dashboard</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Curated custom educational roadmaps</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center relative z-10" id="landing-cta-section">
        <div className="bg-theme-surface border border-theme-border rounded-3xl p-10 md:p-14 shadow-xl dark:shadow-2xl relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-theme-accent/10 rounded-full blur-3xl -z-10 pointer-events-none" />
          <h2 className="text-3xl font-extrabold text-theme-text-primary mb-4">Are you ready to land your dream role?</h2>
          <p className="text-theme-text-secondary text-sm max-w-xl mx-auto mb-8 leading-relaxed font-medium">
            Configure your technical variables, analyze your history, and leverage the exact cognitive models recruiters use to assess candidates.
          </p>
          <button
            onClick={() => setCurrentPage("register")}
            className="bg-theme-accent hover:bg-theme-accent/90 text-white font-bold py-3.5 px-10 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2 mx-auto text-md border border-theme-accent/20"
          >
            <span>Create Free Account</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-theme-border text-center text-xs text-theme-text-secondary max-w-7xl mx-auto leading-relaxed relative z-10 mt-12">
        <p>© 2026 InterviewAce AI, Inc. Powered securely by Google DeepMind Gemini API. All rights reserved.</p>
      </footer>
    </div>
  );
};

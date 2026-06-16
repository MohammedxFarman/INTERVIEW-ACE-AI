/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { UserPlus, Key, Mail, User as UserIcon, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

interface RegisterPageProps {
  setCurrentPage: (page: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ setCurrentPage }) => {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill out all registration fields.");
      return;
    }
    setError(null);
    setProcessing(true);
    try {
      await register(name, email, password);
      setCurrentPage("dashboard");
    } catch (err: any) {
      setError(err?.message || "Registration failed. This email could be taken.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-theme-bg min-h-[calc(100vh-65px)] flex items-center justify-center px-4 py-12 text-theme-text-primary transition-colors duration-300">
      <div className="w-full max-w-md bg-theme-card border border-theme-border p-8 rounded-3xl shadow-xl animate-fade-in">
        
        {/* Navigation Indicator */}
        <button 
          onClick={() => setCurrentPage("landing")}
          className="flex items-center space-x-1.5 text-theme-text-secondary hover:text-theme-text-primary text-xs mb-8 group cursor-pointer transition-colors"
          id="btn-register-back-landing"
        >
          <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </button>

        {/* Header Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-theme-text-primary tracking-tight">Create Account</h2>
          <p className="text-xs text-theme-text-secondary mt-1.5 font-semibold">Get recruiter-grade mock interviews in one minute</p>
        </div>

        {/* Error Container */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-200 text-xs p-3.5 rounded-lg flex items-start space-x-2.5 mb-6 animate-shake" id="register-error-card">
            <AlertCircle className="h-4.5 w-4.5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
            <span className="leading-normal">{error}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-5" id="register-form">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-theme-text-secondary uppercase tracking-wider block">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-theme-text-secondary/50">
                <UserIcon className="h-4.5 w-4.5" />
              </div>
              <input
                id="input-register-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full bg-theme-bg border border-theme-border focus:border-theme-accent rounded-xl py-2.5 pl-10 pr-4 text-sm text-theme-text-primary placeholder-theme-text-secondary/40 focus:outline-none transition-colors duration-150"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-theme-text-secondary uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-theme-text-secondary/50">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <input
                id="input-register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@interviewace.ai"
                className="w-full bg-theme-bg border border-theme-border focus:border-theme-accent rounded-xl py-2.5 pl-10 pr-4 text-sm text-theme-text-primary placeholder-theme-text-secondary/40 focus:outline-none transition-colors duration-150"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-theme-text-secondary uppercase tracking-wider block">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-theme-text-secondary/50">
                <Key className="h-4.5 w-4.5" />
              </div>
              <input
                id="input-register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-theme-bg border border-theme-border focus:border-theme-accent rounded-xl py-2.5 pl-10 pr-4 text-sm text-theme-text-primary placeholder-theme-text-secondary/40 focus:outline-none transition-colors duration-150"
                required
              />
            </div>
          </div>

          <button
            id="btn-register-submit"
            type="submit"
            disabled={processing}
            className="w-full h-11 bg-theme-accent hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md mt-8"
          >
            {processing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Creating Elite Profile...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4.5 w-4.5" />
                <span className="text-sm">Join Platform</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-8 text-center border-t border-theme-border pt-6">
          <p className="text-xs text-theme-text-secondary">
            Already have an active account?{" "}
            <button
              id="btn-register-toggle-signin"
              onClick={() => setCurrentPage("login")}
              className="text-theme-accent hover:underline font-bold transition-all cursor-pointer ml-1 bg-transparent"
            >
              Sign In Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { LogIn, Key, Mail, AlertCircle, ArrowLeft, Loader2, Fingerprint } from "lucide-react";
import {
  checkBiometricAvailability,
  isCredentialsSaved,
  saveBiometricCredentials,
  deleteBiometricCredentials,
  performBiometricVerification,
  getBiometricCredentials,
  isNativePlatform
} from "../utils/biometric";

interface LoginPageProps {
  setCurrentPage: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setCurrentPage }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Biometric states
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [hasSavedCreds, setHasSavedCreds] = useState(false);
  const [saveOnLogin, setSaveOnLogin] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);

  // Simulated web verification interface state
  const [showSimulatedModal, setShowSimulatedModal] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  useEffect(() => {
    const checkBiometric = async () => {
      try {
        const avail = await checkBiometricAvailability();
        setBiometricAvailable(avail.available);
        setIsSimulated(!!avail.isSimulated);

        const saved = await isCredentialsSaved();
        setHasSavedCreds(saved);
        if (saved) {
          setSaveOnLogin(true);
        }
      } catch (err) {
        console.error("Biometric initialization check failed", err);
      }
    };
    checkBiometric();
  }, []);

  // Web simulated scan simulation handler
  useEffect(() => {
    let timer: any;
    if (showSimulatedModal) {
      timer = setInterval(() => {
        setSimulatedProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setTimeout(async () => {
              setShowSimulatedModal(false);
              setProcessing(true);
              try {
                const credentials = await getBiometricCredentials();
                if (credentials && credentials.username && credentials.password) {
                  await login(credentials.username, credentials.password);
                  setCurrentPage("dashboard");
                } else {
                  setError("No simulated biometric registration found.");
                }
              } catch (err: any) {
                setError(err?.message || "Simulated login failed.");
              } finally {
                setProcessing(false);
              }
            }, 500);
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    }
    return () => clearInterval(timer);
  }, [showSimulatedModal]);

  const handleBiometricLogin = async () => {
    setError(null);
    if (!hasSavedCreds) {
      setError("No biometric credentials registered on this device yet. Please login manually first and enable biometrics.");
      return;
    }

    if (!isNativePlatform()) {
      setShowSimulatedModal(true);
      setSimulatedProgress(0);
      return;
    }

    // Real native system flow
    setProcessing(true);
    try {
      const verified = await performBiometricVerification("Confirm your identity to launch InterviewAce AI");
      if (verified) {
        const credentials = await getBiometricCredentials();
        if (credentials && credentials.username && credentials.password) {
          await login(credentials.username, credentials.password);
          setCurrentPage("dashboard");
        } else {
          setError("Failed to retrieve biosecure keys. Please authenticate manually.");
        }
      } else {
        setError("Biometric validation cancelled or unsuccessful.");
      }
    } catch (err: any) {
      setError(err?.message || "Biometric authentication failed.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please key in your email and password.");
      return;
    }
    setError(null);
    setProcessing(true);
    try {
      await login(email, password);

      // Save/Unregister biometric credentials based on the opt-in state
      if (saveOnLogin) {
        await saveBiometricCredentials(email, password);
      } else {
        await deleteBiometricCredentials();
      }

      setCurrentPage("dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid email or password combination.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-theme-bg min-h-[calc(100vh-65px)] flex items-center justify-center px-4 py-12 text-theme-text-primary transition-colors duration-300">
      <div className="w-full max-w-md bg-theme-card border border-theme-border p-8 rounded-3xl shadow-xl">
        
        {/* Navigation Indicator */}
        <button 
          onClick={() => setCurrentPage("landing")}
          className="flex items-center space-x-1.5 text-theme-text-secondary hover:text-theme-text-primary text-xs mb-8 group cursor-pointer transition-colors border-none bg-transparent"
          id="btn-login-back-landing"
        >
          <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </button>

        {/* Header Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-theme-text-primary tracking-tight">Welcome Back</h2>
          <p className="text-xs text-theme-text-secondary mt-1.5 font-semibold">Continue acing your interview preparations</p>
        </div>

        {/* Error Container */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-200 text-xs p-3.5 rounded-lg flex items-start space-x-2.5 mb-6 animate-shake" id="login-error-card">
            <AlertCircle className="h-4.5 w-4.5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
            <span className="leading-normal">{error}</span>
          </div>
        )}

        {/* Biometric Quick Login Action Area */}
        {biometricAvailable && hasSavedCreds && (
          <div className="mb-6 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-center space-y-3" id="biometric-quick-login-card">
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider font-mono block">Secured Quick Launch</span>
            <button
              type="button"
              id="btn-biometric-auth-trigger"
              onClick={handleBiometricLogin}
              disabled={processing}
              className="mx-auto h-16 w-16 bg-gradient-to-tr from-indigo-600 to-violet-500 hover:from-indigo-500 hover:to-violet-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/25 dark:shadow-indigo-950/40 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50 group border border-indigo-400/30"
            >
              <Fingerprint className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
            </button>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Sign in with Biometrics</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{isSimulated ? "Simulated Fingerprint / Face ID" : "Secure biometrics authentication active"}</p>
            </div>
            
            <button
              type="button"
              onClick={async () => {
                await deleteBiometricCredentials();
                setHasSavedCreds(false);
                setSaveOnLogin(false);
              }}
              className="text-[10px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 underline cursor-pointer bg-transparent border-none mt-1"
            >
              Remove registered biometric credentials
            </button>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-theme-text-secondary uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-theme-text-secondary/50">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <input
                id="input-login-email"
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
                id="input-login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-theme-bg border border-theme-border focus:border-theme-accent rounded-xl py-2.5 pl-10 pr-4 text-sm text-theme-text-primary placeholder-theme-text-secondary/40 focus:outline-none transition-colors duration-150"
                required
              />
            </div>
          </div>

          {/* Biometric Enable toggle option */}
          {biometricAvailable && (
            <div className="flex items-start space-x-2.5 mt-2" id="login-biometric-optin">
              <input
                id="checkbox-biometric-enable"
                type="checkbox"
                checked={saveOnLogin}
                onChange={(e) => setSaveOnLogin(e.target.checked)}
                className="h-4.5 w-4.5 bg-theme-bg border-theme-border text-theme-accent rounded-lg focus:ring-theme-accent cursor-pointer mt-0.5"
              />
              <label htmlFor="checkbox-biometric-enable" className="text-xs text-theme-text-secondary select-none cursor-pointer font-medium leading-tight">
                Trust this device and register biometric credentials for direct instant entry {isSimulated && <span className="text-[10px] text-theme-accent font-bold block mt-0.5">(Preview Mode Enabled)</span>}
              </label>
            </div>
          )}

          <button
            id="btn-login-submit"
            type="submit"
            disabled={processing}
            className="w-full h-11 bg-theme-accent hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md mt-8"
          >
            {processing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Authenticating Account...</span>
              </>
            ) : (
              <>
                <LogIn className="h-4.5 w-4.5" />
                <span className="text-sm">Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-8 text-center border-t border-theme-border pt-6">
          <p className="text-xs text-theme-text-secondary">
            Don't have an account of your own?{" "}
            <button
              id="btn-login-toggle-signup"
              onClick={() => setCurrentPage("register")}
              className="text-theme-accent hover:underline font-bold transition-all cursor-pointer ml-1 bg-transparent"
            >
              Sign Up Free
            </button>
          </p>
        </div>
      </div>

      {/* Simulated Biometric Modal Overlay for Web Iframe Previews */}
      {showSimulatedModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" id="simulated-biometric-modal">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl text-center space-y-6 shadow-2xl">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Biometric Sign In</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Verifying secure credentials for InterviewAce AI</p>
              </div>

              {/* Precise Circular Pulse Indicator */}
              <div className="relative mx-auto h-24 w-24 bg-slate-50 dark:bg-slate-950 rounded-full border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center">
                <div className="absolute inset-1 border-2 border-indigo-500/10 rounded-full animate-ping" />
                <div className="absolute inset-2 border-2 border-indigo-500/20 rounded-full animate-pulse" />
                
                <div 
                  className="absolute inset-0 rounded-full transition-all duration-150 rotate-[-90deg]"
                  style={{
                    background: `conic-gradient(#5046e5 ${simulatedProgress}%, transparent ${simulatedProgress}%)`,
                    opacity: 0.2
                  }}
                />

                <Fingerprint className="h-12 w-12 text-indigo-650 dark:text-indigo-450 relative z-10 animate-pulse" />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Scanning Fingerprint...</p>
                <div className="w-full bg-slate-100 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div 
                    className="bg-indigo-600 dark:bg-indigo-650 h-full rounded-full transition-all duration-150"
                    style={{ width: `${simulatedProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">{simulatedProgress}% Complete</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSimulatedModal(false)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer"
            >
              Cancel Authentication
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

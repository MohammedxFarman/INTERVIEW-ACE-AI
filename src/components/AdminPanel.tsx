/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { ProjectStats } from "../types";
import { 
  ShieldCheck, 
  Users, 
  Layers, 
  LineChart, 
  Loader2, 
  AlertCircle,
  TrendingUp,
  Award,
  Zap,
  Clock,
  Briefcase
} from "lucide-react";

export const AdminPanel: React.FC = () => {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const data = await api.admin.getStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Failed to retrieve administrative telemetry statistics.");
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)] px-6 py-8 md:py-12" id="admin-panel-container">
      <div className="max-w-4xl mx-auto">
        
        {/* Headline */}
        <div className="flex items-center space-x-3 mb-10 border-b border-slate-900 pb-5">
          <ShieldCheck className="h-8 w-8 text-indigo-400" />
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin System Telemetry</h1>
            <p className="text-slate-400 text-sm mt-0.5">Maintain granular observability oversight regarding global candidate activity metrics.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-900/30 text-red-200 text-xs p-4 rounded-xl flex items-center space-x-2.5 mb-8" id="admin-error">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24" id="admin-loading">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
            <span className="text-xs text-slate-400 ml-3 font-semibold">Aggregating database summaries...</span>
          </div>
        ) : !stats ? (
          <div className="text-center py-8">
            <p className="text-xs text-slate-500">Awaiting sitewide parameters.</p>
          </div>
        ) : (
          /* TELEMETRY MAIN GRID */
          <div className="space-y-8" id="admin-stats-grid">
            
            {/* Aggregate counters row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4">
                <div className="bg-indigo-950/80 text-indigo-400 p-3.5 rounded-xl border border-indigo-900/40 shrink-0">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Registered Candidates</span>
                  <h3 className="text-3xl font-black text-white mt-1">{stats.userCount}</h3>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4">
                <div className="bg-purple-950/80 text-purple-400 p-3.5 rounded-xl border border-purple-900/40 shrink-0">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Total Interviews Conducted</span>
                  <h3 className="text-3xl font-black text-white mt-1">{stats.totalInterviews}</h3>
                </div>
              </div>

            </div>

            {/* Average Subscales card list */}
            <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest block mb-1">Global aggregates</span>
              <h3 className="text-lg font-bold text-white mb-6">Candidate Core Competencies Mean</h3>

              <div className="space-y-5" id="admin-averages-bars">
                
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2 text-slate-300">
                    <span>Overall Score</span>
                    <span className="text-indigo-400">{stats.averageScores.overall}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full border border-slate-850 overflow-hidden">
                    <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${stats.averageScores.overall}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2 text-slate-300">
                    <span>Technical Skill Level</span>
                    <span className="text-indigo-400">{stats.averageScores.technical}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full border border-slate-850 overflow-hidden">
                    <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${stats.averageScores.technical}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2 text-slate-300">
                    <span>Communication Skills</span>
                    <span className="text-indigo-400">{stats.averageScores.communication}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full border border-slate-850 overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${stats.averageScores.communication}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2 text-slate-300">
                    <span>Interviewing Confidence</span>
                    <span className="text-indigo-400">{stats.averageScores.confidence}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full border border-slate-850 overflow-hidden">
                    <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${stats.averageScores.confidence}%` }} />
                  </div>
                </div>

              </div>
            </div>

            {/* Note text box */}
            <div className="bg-indigo-950/25 border border-indigo-900/35 p-5 rounded-2xl flex items-start space-x-3 text-xs leading-normal text-indigo-300">
              <Clock className="h-5 w-5 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block text-white mb-0.5">Observability Metrics Policy</span>
                These metrics compile global sitewide means mapped from active databases securely. This aids in system health reviews, API loading latency calibrations, and general system verification processes.
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend
} from "recharts";
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  FileText, 
  Loader2, 
  AlertCircle,
  Clock,
  Sparkles,
  Calendar,
  Gauge,
  Activity,
  CheckCircle2,
  Zap,
  Flame,
  ShieldAlert
} from "lucide-react";
import { motion } from "motion/react";

interface AnalyticsProps {
  setCurrentPage: (page: string) => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({ setCurrentPage }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    interviewTrends: { date: string; score: number; role: string }[];
    skillCategoryChart: { subject: string; A: number }[];
    resumeImprovementTrend: { name: string; score: number; ats: number }[];
    dsaPerformance?: Record<string, { name: string; accuracy: number; speed: number }[]>;
  } | null>(null);

  const [activeDsaCategory, setActiveDsaCategory] = useState<string>("Arrays & Sliding Window");

  const [selectedTopicId, setSelectedTopicId] = useState<string>("dp");
  const [selectedStageId, setSelectedStageId] = useState<string>("tech");

  const heatmapStages = [
    { id: "intro", name: "Communication & Pitch", short: "Intro/Pitch" },
    { id: "tech", name: "Technical Depth", short: "Tech Depth" },
    { id: "code", name: "Coding Logic", short: "Coding Logic" },
    { id: "dryrun", name: "Dry Running Code", short: "Dry Run" },
    { id: "behavioral", name: "Behavioral Fits", short: "Behavioral" }
  ];

  const heatmapTopics = [
    { id: "dp", name: "Dynamic Prog. & Greedy Alg.", category: "DSA" },
    { id: "system", name: "System Design & Scalability", category: "Architecture" },
    { id: "async", name: "Concurrency & Event-Loop", category: "Runtimes" },
    { id: "db", name: "Indexing & DB Optimisation", category: "Storage" },
    { id: "graphs", name: "Graph & Tree Traversals", category: "DSA" }
  ];

  const heatmapData: Record<string, Record<string, {
    score: number;
    prevalence: string;
    severity: "Critical Deficit" | "Notable Gap" | "Stable Competency" | "High Strength";
    observation: string;
    playbook: string[];
  }>> = {
    dp: {
      intro: {
        score: 30,
        prevalence: "28% of sessions",
        severity: "Stable Competency",
        observation: "Can pitch approach but struggles to state base case constraints initially.",
        playbook: ["Verify base case checks aloud before laying down recursive loops.", "Practice recursive tree transitions diagrams first."]
      },
      tech: {
        score: 75,
        prevalence: "81% of sessions",
        severity: "Critical Deficit",
        observation: "Difficulty establishing overlapping subproblems vs optimal substructure boundaries.",
        playbook: ["Review memoization maps vs tabular 2D arrays standard formats.", "Deconstruct the Knapsack & MCM problem families visual stages."]
      },
      code: {
        score: 85,
        prevalence: "90% of sessions",
        severity: "Critical Deficit",
        observation: "Translation from recursive formulas to bottom-up DP states often features index out of bounds errors.",
        playbook: ["Implement top-down dynamic programming with state maps to bypass array index boundaries safely.", "Draw the DP table with seed inputs manually."]
      },
      dryrun: {
        score: 65,
        prevalence: "68% of sessions",
        severity: "Notable Gap",
        observation: "Dry-running arrays is skipped, leading to failure in detecting off-by-one errors on base arrays.",
        playbook: ["Choose a simple string value (e.g. length 2) and trace DP transitions line by line.", "Log base arrays print states."]
      },
      behavioral: {
        score: 15,
        prevalence: "12% of sessions",
        severity: "High Strength",
        observation: "Explains resource trade-offs and complexity calculations using standard STAR criteria cleanly.",
        playbook: ["Maintain current structure: outline runtime vs space memory tradeoffs explicitly."]
      }
    },
    system: {
      intro: {
        score: 42,
        prevalence: "40% of sessions",
        severity: "Notable Gap",
        observation: "Omits gathering non-functional scale metrics (DAU, storage size, read write ratios) during initial pitch.",
        playbook: ["Write out a cheat sheet for standard back-of-the-envelope storage calculations.", "Ask clarifying scale constraints before drawing any block diagrams."]
      },
      tech: {
        score: 68,
        prevalence: "74% of sessions",
        severity: "Notable Gap",
        observation: "Confuses DB partitioning styles (Horizontal Sharding vs Vertical Partitioning) under replication stresses.",
        playbook: ["Compare hashing based sharding vs range based sharding on active nodes.", "Acknowledge primary-replica write contention bounds."]
      },
      code: {
        score: 45,
        prevalence: "41% of sessions",
        severity: "Notable Gap",
        observation: "API schema definitions lack rate-limiting tags, payload validations or idempotent transaction tags.",
        playbook: ["Suggest standard Token Bucket middleware algorithms.", "Add client token headers to prevent network replay spikes."]
      },
      dryrun: {
        score: 25,
        prevalence: "20% of sessions",
        severity: "Stable Competency",
        observation: "Systematically walks through traffic flows (load balancers -> app gateways -> cache layers -> DB tables).",
        playbook: ["Walkthrough cache write-through/write-behind strategies under load spikes."]
      },
      behavioral: {
        score: 55,
        prevalence: "58% of sessions",
        severity: "Notable Gap",
        observation: "Tends to take full authorship of system decisions instead of discussing collaborative engineering tradeoffs.",
        playbook: ["Frame architecture decisions as a balanced dialogue with senior staff peers.", "Incorporate business priorities in architecture scaling choice paths."]
      }
    },
    async: {
      intro: {
        score: 20,
        prevalence: "15% of sessions",
        severity: "High Strength",
        observation: "Articulates single-threaded execution vs background worker thread pools perfectly and elegantly.",
        playbook: ["Continue highlighting thread-pool management in asynchronous systems."]
      },
      tech: {
        score: 80,
        prevalence: "85% of sessions",
        severity: "Critical Deficit",
        observation: "Struggles with Node.js Event Loop phases (microtask queue priority, timers, setImmediate).",
        playbook: ["Draw the event loop phase diagram (Timers, Pending Callbacks, Poll, Check, Close).", "Examine process.nextTick priority over traditional Promise.resolve callbacks."]
      },
      code: {
        score: 70,
        prevalence: "72% of sessions",
        severity: "Notable Gap",
        observation: "Frequent unhandled promise rejections, lack of async/await try-catch error safety harnesses.",
        playbook: ["Equip every asynchronous route call with an explicit error-bound catch block.", "Utilize general promise-all exception aggregators."]
      },
      dryrun: {
        score: 60,
        prevalence: "62% of sessions",
        severity: "Notable Gap",
        observation: "Fails to trace potential race conditions on global state updates with concurrent requests.",
        playbook: ["Trace requests intersecting on shared singleton state variables.", "Simulate high-concurrency API runs with sleep delays."]
      },
      behavioral: {
        score: 35,
        prevalence: "30% of sessions",
        severity: "Stable Competency",
        observation: "Explains experience troubleshooting deadlocks or high thread count system crashes in past roles.",
        playbook: ["Cite specific profiling tools (such as Chrome DevTools or pprof) used during triage."]
      }
    },
    db: {
      intro: {
        score: 15,
        prevalence: "12% of sessions",
        severity: "High Strength",
        observation: "Introduces index selection parameters as early constraints in DB schema design phases.",
        playbook: ["Keep up the early focus on index design during database modeling discussions."]
      },
      tech: {
        score: 62,
        prevalence: "65% of sessions",
        severity: "Notable Gap",
        observation: "Difficulty highlighting the exact difference between B-Trees vs LSM-Trees write speeds.",
        playbook: ["Contrast memory-mapped databases (LSM) against disk block page writes structures.", "Practice drawing B-Tree node split mechanisms."]
      },
      code: {
        score: 58,
        prevalence: "60% of sessions",
        severity: "Notable Gap",
        observation: "Creates composite indexes but is unaware of the leftmost-prefix matching rule, leading to full scans.",
        playbook: ["Always arrange composite query filters based on query field cardinality weights.", "Analyze the EXPLAIN results for composite index lookups."]
      },
      dryrun: {
        score: 75,
        prevalence: "79% of sessions",
        severity: "Critical Deficit",
        observation: "Unaware of dynamic deadlock loops under high concurrency row modifications in standard isolation levels.",
        playbook: ["Study Postgres/MySQL row lock escalation criteria (SELECT FOR UPDATE/SHARE).", "Optimize code to consistently request locks in a predetermined static order."]
      },
      behavioral: {
        score: 30,
        prevalence: "25% of sessions",
        severity: "Stable Competency",
        observation: "Speaks confidently about standard data migration scripts and zero-downtime database upgrades.",
        playbook: ["Focus on explaining the dual-write schema migration phase pattern."]
      }
    },
    graphs: {
      intro: {
        score: 35,
        prevalence: "32% of sessions",
        severity: "Stable Competency",
        observation: "States clear reasons for choosing BFS (shortest path) vs DFS (exhaustive back-tracking).",
        playbook: ["Always confirm standard vertex/edge counts to support layout constraints."]
      },
      tech: {
        score: 48,
        prevalence: "50% of sessions",
        severity: "Notable Gap",
        observation: "Confuses Dijkstra's algorithm limitations (fails on negative cycle edges) with Bellman-Ford.",
        playbook: ["Read the structural difference of edge relaxation limits in Bellman-Ford calculations.", "Understand cycle detection routines."]
      },
      code: {
        score: 65,
        prevalence: "68% of sessions",
        severity: "Notable Gap",
        observation: "Neglects cycle-detection visited sets, leading to stack overflow recurse loops on cyclic inputs.",
        playbook: ["Instantiate an explicit 'visited' or 'processing' enum set before entering any DFS recursion node.", "Test recursive code on a simple self-referencing cycle first."]
      },
      dryrun: {
        score: 55,
        prevalence: "58% of sessions",
        severity: "Notable Gap",
        observation: "Traces tree recursion path stacks manually but miscalculates state restoration on returns.",
        playbook: ["Practice printing recursion depth indentation spacing loops to view tree states in debug consoles.", "Double check return values capture logic."]
      },
      behavioral: {
        score: 25,
        prevalence: "22% of sessions",
        severity: "Stable Competency",
        observation: "Answers systemic team dynamic challenges gracefully with elegant communication guidelines.",
        playbook: ["Demonstrate how technical consensus is resolved through peer-to-peer visual walkthroughs."]
      }
    }
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.analytics.getMetrics();
        setData(res);
      } catch (err: any) {
        setError(err.message || "Failed to compile custom charts metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="bg-transparent text-slate-800 dark:text-slate-100 min-h-[calc(100vh-65px)] px-6 py-8 md:py-12" id="analytics-container">
      <div className="max-w-7xl mx-auto">
        
        {/* Banner */}
        <div className="flex items-center space-x-3 mb-10">
          <BarChart3 className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Performance Analytics</h1>
            <p className="text-slate-550 dark:text-slate-400 text-sm mt-0.5 font-medium">Observe chronological score timelines and technical progress matrices.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-900/30 text-red-205 text-xs p-4 rounded-xl flex items-center space-x-2.5 mb-8" id="analytics-error">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24" id="analytics-loading">
            <Loader2 className="h-10 w-10 text-indigo-550 animate-spin" />
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-3 font-semibold">Generating visual charts timeline...</span>
          </div>
        ) : !data || (data.interviewTrends.length === 0 && data.resumeImprovementTrend.length === 0) ? (
          /* EMPTY FALLBACK CONTAINER */
          <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-805 p-12 rounded-2xl text-center max-w-xl mx-auto shadow-sm" id="analytics-empty">
            <Sparkles className="h-8 w-8 text-slate-400 dark:text-slate-600 mx-auto mb-3.5" />
            <h3 className="text-md font-bold text-slate-900 dark:text-white mb-2">Metrics Pending Active Sessions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto mb-6">
              Take part in technical mock interviews or initiate a resume analysis check to initialize charts timeline statistics.
            </p>
            <button
              onClick={() => setCurrentPage("mock-interview")}
              className="bg-indigo-600 hover:bg-indigo-505 text-white font-bold py-2.5 px-6 rounded-xl text-xs cursor-pointer shadow-md"
            >
              Start First AI Session
            </button>
          </div>
        ) : (
          /* CORE BENTO CHARTS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="analytics-charts-grid">
            
            {/* Chart 1: Interview Score timelines */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl lg:col-span-2 shadow-sm">
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Interview Score Growth Timeline</h3>
              </div>
              <div className="h-72 w-full text-xs">
                {data.interviewTrends.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    <span>Awaiting completed interview milestones.</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.interviewTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                      <XAxis dataKey="date" stroke="#64748b" />
                      <YAxis domain={[0, 100]} stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} 
                        labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                      <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3.5} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 2: Radar matrix skills groups */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center space-x-1.5 mb-6 text-indigo-600 dark:text-indigo-400">
                <Award className="h-4.5 w-4.5" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Core Skills Map</h3>
              </div>
              <div className="h-72 w-full text-xs flex justify-center">
                {data.interviewTrends.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    <span>Take interviews to populate skills strengths.</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.skillCategoryChart}>
                      <PolarGrid stroke="rgba(148, 163, 184, 0.15)" />
                      <PolarAngleAxis dataKey="subject" stroke="#64748b" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                      <Radar name="Skills score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 3: Resume scores evaluation revisions bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl lg:col-span-3 shadow-md">
              <div className="flex items-center space-x-2 mb-6">
                <FileText className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Resume vs ATS Score Revisions</h3>
              </div>
              <div className="h-72 w-full text-xs">
                {data.resumeImprovementTrend.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    <span>Awaiting resume evaluation milestones parameters.</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.resumeImprovementTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis domain={[0, 100]} stroke="#64748b" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      />
                      <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="ats" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* NEW SECTION: DSA Category Performance Tracking Over Time (Speed & Accuracy) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800/80 p-6 rounded-3xl lg:col-span-3 shadow-md mt-4" id="dsa-performance-analytics-card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-pink-100 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900/30 rounded-xl">
                      <Gauge className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Algorithmic Performance Matrix</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Chronologically track speed complexity and accuracy rate improvements across core DSA classifications.</p>
                    </div>
                  </div>
                </div>

                {/* Categories selector pills */}
                <div className="flex flex-wrap items-center gap-1.5" id="dsa-category-selector-pills">
                  {[
                    "Arrays & Sliding Window",
                    "Stacks & Queues",
                    "Trees & BSTs",
                    "HashMaps & Strings",
                    "Sorting & Benchmarking"
                  ].map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveDsaCategory(category)}
                      className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        activeDsaCategory === category
                          ? "bg-pink-650 text-white shadow-sm border-pink-600"
                          : "bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
                      }`}
                    >
                      {category.split(" & ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart and score details dashboard content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visualizer Chart */}
                <div className="lg:col-span-2">
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900/60 p-4.5 rounded-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 pb-3 border-b border-slate-200 dark:border-slate-900/40">
                      <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                        {activeDsaCategory} Speed & Accuracy Trend
                      </div>
                      <div className="flex items-center space-x-4 text-[10px] font-mono font-bold">
                        <div className="flex items-center space-x-1.5">
                          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="text-slate-500 dark:text-slate-400">Accuracy (%)</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="inline-block h-2 w-2 rounded-full bg-pink-500" />
                          <span className="text-slate-500 dark:text-slate-400">Execution Speed (ms)</span>
                        </div>
                      </div>
                    </div>

                    <div className="h-72 w-full text-xs">
                      {(() => {
                        const defaultPerf = [
                          { name: "Week 1", accuracy: 60, speed: 200 },
                          { name: "Week 2", accuracy: 70, speed: 150 },
                          { name: "Week 3", accuracy: 80, speed: 110 },
                          { name: "Week 4", accuracy: 90, speed: 75 }
                        ];
                        const perfData = data.dsaPerformance?.[activeDsaCategory] || defaultPerf;

                        return (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={perfData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                              <XAxis dataKey="name" stroke="#64748b" className="font-mono text-[10px]" />
                              
                              {/* Left Axis - Accuracy */}
                              <YAxis 
                                yAxisId="left" 
                                domain={[0, 100]} 
                                stroke="#10b981" 
                                className="font-mono text-[9px]"
                                label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', style: { fill: '#10b981', textAnchor: 'middle', fontSize: '9px', fontWeight: 'bold' } }}
                              />
                              
                              {/* Right Axis - Speed (lower is better, but plotting on natural scale) */}
                              <YAxis 
                                yAxisId="right" 
                                orientation="right" 
                                stroke="#ec4899" 
                                className="font-mono text-[9px]"
                                label={{ value: 'Latency (ms)', angle: 90, position: 'insideRight', style: { fill: '#ec4899', textAnchor: 'middle', fontSize: '9px', fontWeight: 'bold' } }}
                              />
                              
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                                labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '11px', fontFamily: 'monospace' }}
                                itemStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
                              />
                              
                              <Line 
                                yAxisId="left" 
                                type="monotone" 
                                dataKey="accuracy" 
                                stroke="#10b981" 
                                strokeWidth={3} 
                                name="Accuracy"
                                activeDot={{ r: 7 }} 
                              />
                              
                              <Line 
                                yAxisId="right" 
                                type="monotone" 
                                dataKey="speed" 
                                stroke="#ec4899" 
                                strokeWidth={3} 
                                name="Speed (ms)" 
                                activeDot={{ r: 7 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Metric breakdown cards on the right */}
                <div className="flex flex-col justify-between space-y-4">
                  {(() => {
                    const defaultPerf = [
                      { name: "Week 1", accuracy: 60, speed: 200 },
                      { name: "Week 2", accuracy: 70, speed: 150 },
                      { name: "Week 3", accuracy: 80, speed: 110 },
                      { name: "Week 4", accuracy: 90, speed: 75 }
                    ];
                    const perfData = data.dsaPerformance?.[activeDsaCategory] || defaultPerf;
                    const firstRound = perfData[0];
                    const latestRound = perfData[perfData.length - 1];

                    // Calculations
                    const accuracyDelta = latestRound.accuracy - firstRound.accuracy;
                    const speedupPct = Math.round(((firstRound.speed - latestRound.speed) / firstRound.speed) * 100);

                    // Determine proficiency tier
                    let proficiencyBadge = "Novice ⚡";
                    let proficiencyColor = "text-yellow-600 dark:text-yellow-450 bg-yellow-50 dark:bg-yellow-950/40 border-yellow-250 dark:border-yellow-900/30";
                    if (latestRound.accuracy >= 90) {
                      proficiencyBadge = "Master 🏆";
                      proficiencyColor = "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-250 dark:border-emerald-900/30";
                    } else if (latestRound.accuracy >= 75) {
                      proficiencyBadge = "Proficient 🚀";
                      proficiencyColor = "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-955/40 border-pink-250 dark:border-pink-905/30";
                    }

                    return (
                      <>
                        {/* Title box */}
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 p-4.5 rounded-2xl flex-1 flex flex-col justify-center">
                          <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-500">Skill Competency Level:</span>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`px-3.5 py-1.5 rounded-xl border font-bold font-mono text-[11.5px] uppercase tracking-wider ${proficiencyColor}`}>
                              {proficiencyBadge}
                            </span>
                            <span className="text-xs font-semibold text-slate-550 dark:text-slate-350 font-mono">
                              {perfData.length} checkpoints
                            </span>
                          </div>
                        </div>

                        {/* Accuracy growth stats card */}
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 p-4.5 rounded-2xl flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-500">Correctness accuracy</span>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          </div>
                          <div className="flex items-end space-x-2 mt-2">
                            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">{latestRound.accuracy}%</span>
                            <span className="text-xs font-bold text-emerald-500 dark:text-emerald-450 mb-1 font-mono">
                              {accuracyDelta >= 0 ? `+${accuracyDelta}%` : `${accuracyDelta}%`} improvement
                            </span>
                          </div>
                        </div>

                        {/* Performance Speed improvement stats card */}
                        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 p-4.5 rounded-2xl flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-500">Execution efficiency</span>
                            <Activity className="h-4 w-4 text-pink-500" />
                          </div>
                          <div className="flex items-end space-x-2 mt-2">
                            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">{latestRound.speed}ms</span>
                            <span className="text-xs font-bold text-pink-500 dark:text-pink-450 mb-1 font-mono">
                              {speedupPct >= 0 ? `${speedupPct}% faster` : `${Math.abs(speedupPct)}% slower`}
                            </span>
                          </div>
                        </div>

                        {/* Interactive testing button */}
                        <button
                          onClick={() => setCurrentPage("dsa-visualizer")}
                          className="w-full bg-slate-50 hover:bg-pink-600 dark:bg-slate-950 text-pink-600 dark:text-pink-400 hover:text-white border border-pink-200 dark:border-pink-900/30 hover:border-pink-500 font-bold py-3.5 rounded-2xl text-[10.5px] uppercase tracking-wider cursor-pointer font-mono flex items-center justify-center space-x-2 transition-all duration-150 shadow-sm"
                        >
                          <Zap className="h-3.5 w-3.5 shrink-0 fill-current" />
                          <span>Run Benchmark Sandbox Simulator</span>
                        </button>
                      </>
                    );
                  })()}
                </div>
              </div>
                        {/* AI INTERVIEW WEAK POINTS HEATMAP SECTION */}
            <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800/80 p-6 rounded-3xl lg:col-span-3 shadow-md mt-6" id="ai-weak-points-heatmap">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800/60 flex-wrap">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/30 rounded-xl">
                    <Flame className="h-5.5 w-5.5 text-rose-600 dark:text-rose-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">AI Interview Deficiency Heatmap</h3>
                    <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">Correlation matrix plotting interview stages against specific topics to expose deep weaknesses across past mock rounds.</p>
                  </div>
                </div>

                {/* Heatmap intensity legend */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold mr-1">Deficit Intensity Legend:</span>
                  <div className="flex flex-wrap items-center gap-3 text-[10.5px]">
                    <div className="flex items-center space-x-1.5">
                      <div className="h-3.5 w-3.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
                      <span className="text-slate-500 dark:text-slate-400 text-[10px]">0-25% (Strength)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="h-3.5 w-3.5 rounded bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/30" />
                      <span className="text-slate-500 dark:text-slate-400 text-[10px]">26-50% (Stable)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="h-3.5 w-3.5 rounded bg-amber-500/10 dark:bg-amber-955/45 border border-amber-500/30 fill-none" />
                      <span className="text-slate-550 dark:text-slate-400 text-[10px] font-medium">51-75% (Gap)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="h-3.5 w-3.5 rounded bg-rose-500/20 dark:bg-rose-500/30 border border-rose-500/55 animate-pulse" />
                      <span className="text-rose-600 dark:text-rose-450 text-[10px] font-bold">76-100% (Critical)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Heatmap Grid & Analysis Details Bento Panel */}
              <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                
                {/* Heatmap Grid Container - 3 Columns on Desktop */}
                <div className="xl:col-span-3 flex flex-col justify-between">
                  {/* Heatmap Responsive grid wrapper */}
                  <div className="overflow-x-auto pb-2">
                    <div className="min-w-[620px]">
                      {/* Grid Header line: Stages */}
                      <div className="grid grid-cols-6 gap-2 mb-2">
                        {/* Empty spacer for topics column */}
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-550 flex items-end pb-1 pl-2">
                          Core Topics
                        </div>
                        {heatmapStages.map((stage) => {
                          const isStageActive = selectedStageId === stage.id;
                          return (
                            <div 
                              key={stage.id} 
                              className={`text-center p-2 rounded-lg transition-colors duration-250 ${
                                isStageActive ? "bg-slate-150 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" : ""
                              }`}
                            >
                              <span className={`text-[11px] font-bold block leading-snug transition-colors ${
                                isStageActive ? "text-indigo-650 dark:text-indigo-400 font-black" : "text-slate-600 dark:text-slate-300"
                              }`}>
                                {stage.short}
                              </span>
                              <span className="text-[8.5px] text-slate-500 block uppercase font-mono tracking-tighter mt-0.5">
                                Stage check
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Grid Rows: Topics + Cells */}
                      <div className="space-y-2">
                        {heatmapTopics.map((topic) => {
                          const isTopicActive = selectedTopicId === topic.id;
                          return (
                            <div key={topic.id} className="grid grid-cols-6 gap-2 items-center">
                              {/* Left Topic Header cell */}
                              <div className={`p-2 rounded-xl transition-all border ${
                                isTopicActive 
                                  ? "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-805 pl-4 py-2.5 shadow-md shadow-slate-950/5 dark:shadow-slate-950/20" 
                                  : "bg-transparent border-transparent pl-2"
                              }`}>
                                <span className={`text-[11px] font-extrabold block leading-snug transition-colors ${
                                  isTopicActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-800 dark:text-slate-200"
                                }`}>
                                  {topic.name.split(" & ")[0]}
                                </span>
                                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block mt-0.5">
                                  {topic.category} Focus
                                </span>
                              </div>

                              {/* Match cells to stages */}
                              {heatmapStages.map((stage) => {
                                const payload = heatmapData[topic.id]?.[stage.id] || { score: 0, severity: "Stable Competency" };
                                const isSelected = selectedTopicId === topic.id && selectedStageId === stage.id;
                                
                                // Color styles based on weakness score
                                let cellColor = "bg-slate-100 dark:bg-slate-955 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-850/40";
                                if (payload.score >= 76) {
                                  cellColor = "bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-500/35 hover:bg-rose-500/20 dark:hover:bg-rose-500/30";
                                } else if (payload.score >= 51) {
                                  cellColor = "bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-500 border-amber-300 dark:border-amber-500/25 hover:bg-amber-500/20 dark:hover:bg-amber-500/25";
                                } else if (payload.score >= 26) {
                                  cellColor = "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/50";
                                } else {
                                  cellColor = "bg-slate-100/50 dark:bg-slate-950/50 text-slate-400 dark:text-slate-500 border-slate-200/60 dark:border-slate-900/60 hover:bg-slate-200/40 dark:hover:bg-slate-900/45";
                                }

                                return (
                                  <button
                                    key={stage.id}
                                    onClick={() => {
                                      setSelectedTopicId(topic.id);
                                      setSelectedStageId(stage.id);
                                    }}
                                    className={`h-11 rounded-xl border font-mono text-xs font-black tracking-tight flex flex-col items-center justify-center cursor-pointer transition-all duration-150 relative ${cellColor} ${
                                      isSelected 
                                        ? "ring-2 ring-indigo-500 dark:ring-indigo-400 scale-[1.04] shadow-md dark:shadow-lg dark:shadow-indigo-950/60 font-black z-10" 
                                        : "hover:scale-102"
                                    }`}
                                  >
                                    <span className="text-[12px] leading-tight block text-slate-900 dark:text-white">
                                      {payload.score}%
                                    </span>
                                    <span className={`text-[7px] uppercase font-bold tracking-widest mt-0.5 block ${
                                      payload.score >= 76 ? "text-rose-600 dark:text-rose-455 font-extrabold" :
                                      payload.score >= 51 ? "text-amber-550 dark:text-amber-500" :
                                      "text-slate-450 dark:text-slate-500"
                                    }`}>
                                      Deficit
                                    </span>

                                    {/* Indicator dot inside the cell */}
                                    {isSelected && (
                                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 dark:bg-indigo-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600 dark:bg-indigo-500"></span>
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Proactive tip helper */}
                  <div className="mt-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 p-3 rounded-xl flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-slate-450 dark:text-slate-500 shrink-0" />
                    <p className="text-[10.5px] text-slate-550 dark:text-slate-400 leading-normal">
                      <strong>Interactive Mapping:</strong> Click any cell in the deficiency grid to pull up exact transcript summaries, AI observation records, and customized remedial action lists.
                    </p>
                  </div>
                </div>

                {/* AI Observations & Dynamic Playbook Panel - 2 Columns on Desktop */}
                <div className="xl:col-span-2">
                  {(() => {
                    const currentItem = heatmapData[selectedTopicId]?.[selectedStageId];
                    const topicName = heatmapTopics.find(t => t.id === selectedTopicId)?.name || "";
                    const stageName = heatmapStages.find(s => s.id === selectedStageId)?.name || "";

                    if (!currentItem) return null;

                    return (
                      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850/80 rounded-2xl p-5 relative flex flex-col justify-between h-full shadow-inner">
                        <div className="space-y-4">
                          {/* Selected Item header info */}
                          <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-slate-200 dark:border-slate-900">
                            <div>
                              <span className="text-[8.5px] uppercase font-black font-mono tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/30 px-2 py-0.5 rounded-md">
                                {stageName}
                              </span>
                              <h4 className="text-[13px] font-black text-slate-800 dark:text-white leading-tight mt-1.5">
                                {topicName} Defect Analysis
                              </h4>
                            </div>

                            {/* Severity Tag */}
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 font-mono mt-0.5 ${
                              currentItem.score >= 76 ? "bg-rose-50 dark:bg-rose-955 text-rose-605 dark:text-rose-400 border-rose-205 dark:border-rose-900/30" :
                              currentItem.score >= 51 ? "bg-amber-50 dark:bg-amber-955 text-amber-605 dark:text-amber-505 border-amber-205 dark:border-amber-900/30" :
                              currentItem.score >= 26 ? "bg-indigo-50 dark:bg-indigo-955 text-indigo-605 dark:text-indigo-300 border-indigo-250 dark:border-indigo-900/30" :
                              "bg-emerald-50 dark:bg-emerald-955 text-emerald-605 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900/30"
                            }`}>
                              {currentItem.severity}
                            </span>
                          </div>

                          {/* Specific Observation text */}
                          <div>
                            <span className="text-[9.5px] text-slate-450 dark:text-slate-500 font-extrabold uppercase font-mono block tracking-wider mb-1.5">AI Session Assessment Summary</span>
                            <div className="bg-white dark:bg-slate-900/70 border border-slate-150 dark:border-slate-900 p-3 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed italic relative shadow-sm">
                              <ShieldAlert className="absolute right-3.5 top-3 w-4 h-4 text-slate-450 dark:text-slate-600 opacity-20" />
                              "{currentItem.observation}"
                            </div>
                          </div>

                          {/* Actionable Playbook Steps */}
                          <div>
                            <div className="flex items-center space-x-1.5 mb-2">
                              <span className="text-[9.5px] text-slate-450 dark:text-slate-500 font-extrabold uppercase font-mono tracking-wider">REMEDIAL PLAYBOOK INSTRUCTIONS</span>
                              <span className="text-[9px] text-slate-550 dark:text-slate-505 font-mono">({currentItem.prevalence})</span>
                            </div>

                            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                              {currentItem.playbook.map((step, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-900/30 border border-slate-150 dark:border-slate-950 p-2.5 rounded-xl flex items-start space-x-2.5 shadow-sm">
                                  <span className="h-4 w-4 font-mono font-black text-[9px] bg-slate-100 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center shrink-0 border border-slate-205 dark:border-slate-800">
                                    {idx + 1}
                                  </span>
                                  <span className="text-[11px] text-slate-550 dark:text-slate-400 leading-normal">
                                    {step}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Sandbox shortcut launcher */}
                        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-900">
                          {currentItem.score >= 51 ? (
                            <button
                              onClick={() => {
                                if (selectedTopicId === "dp" || selectedTopicId === "graphs") {
                                  setCurrentPage("dsa-visualizer");
                                } else {
                                  setCurrentPage("mock-interview");
                                }
                              }}
                              className="w-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-955 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-350 hover:text-rose-700 dark:text-white text-[10.5px] font-bold font-mono py-2.5 rounded-xl uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all duration-150 cursor-pointer shadow-sm"
                            >
                              <Flame className="h-3.5 w-3.5" />
                              <span>Decongest Heat Defect Area Now</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setCurrentPage("mock-interview")}
                              className="w-full bg-slate-150 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-205 dark:border-slate-850 text-slate-750 dark:text-slate-300 text-[10.5px] font-bold font-mono py-2.5 rounded-xl uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all duration-150 cursor-pointer shadow-sm"
                            >
                              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                              <span>Conduct Core Polish Interview</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>  </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

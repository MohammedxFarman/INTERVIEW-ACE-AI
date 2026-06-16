/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Award, 
  MapPin, 
  BookOpen, 
  ChevronRight, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  MessageSquare,
  Send,
  HelpCircle
} from "lucide-react";

interface DsaRoadmapProps {
  setCurrentPage: (page: string) => void;
  onSelectProblem?: (id: string) => void;
}

interface Topic {
  id: string;
  name: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  subtopics: string[];
  briefDesc: string;
  bestPracticeId: string;
  bestPracticeTitle: string;
}

const ROADMAP_TOPICS: Topic[] = [
  // Beginner
  { id: "arrays", name: "Arrays & Vectors", difficulty: "Beginner", briefDesc: "Continuous block of memory. Perfect for linear traversals and index-based insertions.", subtopics: ["Two Pointers", "Sliding Window", "Subarray sum", "Prefix Sum"], bestPracticeId: "two-sum", bestPracticeTitle: "Two Sum" },
  { id: "strings", name: "String Manipulation", difficulty: "Beginner", briefDesc: "Sequential array of characters. Deals with anagrams, palindromes, and patterns.", subtopics: ["String Hashing", "KMP Algorithm", "Anagram matching"], bestPracticeId: "valid-parentheses", bestPracticeTitle: "Valid Parentheses" },
  { id: "sorting", name: "Sorting Algorithms", difficulty: "Beginner", briefDesc: "Arranging elements in order. Key algorithms are QuickSort, MergeSort, and HeapSort.", subtopics: ["Merge Sort", "Quick Sort", "In-place partition"], bestPracticeId: "two-sum", bestPracticeTitle: "Two Sum" },
  { id: "searching", name: "Searching Mechanics", difficulty: "Beginner", briefDesc: "Finding variables inside lists. Covers binary search on arrays and search spaces.", subtopics: ["Binary Search", "Lower/Upper bound", "Sparse arrays"], bestPracticeId: "two-sum", bestPracticeTitle: "Two Sum" },

  // Intermediate
  { id: "linkedlists", name: "Linked Lists", difficulty: "Intermediate", briefDesc: "Linear collection of data elements whose order is defined by pointers.", subtopics: ["Singly Linked List", "Floyd's Cycle Detection", "Fast & Slow Pointers"], bestPracticeId: "reverse-list", bestPracticeTitle: "Reverse Linked List" },
  { id: "stacks", name: "Stacks", difficulty: "Intermediate", briefDesc: "LIFO: Last In First Out. Essential for parentheses matching, recursion simulation, and backtracks.", subtopics: ["Monotonic Stack", "Expression Parsing", "Next Greater Element"], bestPracticeId: "valid-parentheses", bestPracticeTitle: "Valid Parentheses" },
  { id: "queues", name: "Queues & Dequeues", difficulty: "Intermediate", briefDesc: "FIFO: First In First Out. Core logic behind BFS traversals and processing buffers.", subtopics: ["Circular Queue", "Sliding Window Maximum", "Priority Queue"], bestPracticeId: "two-sum", bestPracticeTitle: "Two Sum" },
  { id: "recursion", name: "Recursion & Backtracking", difficulty: "Intermediate", briefDesc: "Solving a problem where the solution depends on solutions to smaller instances.", subtopics: ["N-Queens Problem", "Permutations & Combinations", "Subsets formulation"], bestPracticeId: "valid-parentheses", bestPracticeTitle: "Valid Parentheses" },
  { id: "trees", name: "Trees & Binary Trees", difficulty: "Intermediate", briefDesc: "Hierarchical dataset structures. Key traversals include Inorder, Preorder, and Postorder.", subtopics: ["BST Traversals", "LCA of Binary Tree", "Depth First Search"], bestPracticeId: "reverse-list", bestPracticeTitle: "Reverse Linked List" },

  // Advanced
  { id: "graphs", name: "Graphs", difficulty: "Advanced", briefDesc: "Nodes joined by directional or undirected vertices. Covers traversals like DFS and BFS.", subtopics: ["Dijkstra's Algorithm", "Union Find (DSU)", "Kruskal's MST", "Topological Sort"], bestPracticeId: "two-sum", bestPracticeTitle: "Two Sum" },
  { id: "heap", name: "Heaps & Priority Queues", difficulty: "Advanced", briefDesc: "Tree-based structure which maintains top max or min elements instantly.", subtopics: ["K-way Merging", "Median of Stream", "Min-Max Heap"], bestPracticeId: "two-sum", bestPracticeTitle: "Two Sum" },
  { id: "dp", name: "Dynamic Programming", difficulty: "Advanced", briefDesc: "Storing solutions to overlapping subproblems to optimize overall runtime constraints.", subtopics: ["Knapsack 0/1", "LCS & LIS variations", "State Compression"], bestPracticeId: "two-sum", bestPracticeTitle: "Two Sum" },
  { id: "trie", name: "Trie (Prefix Trees)", difficulty: "Advanced", briefDesc: "Highly specialized search trees used for quick character prefix match collections.", subtopics: ["Auto-complete search", "XOR Maximum pair", "Regex validation"], bestPracticeId: "valid-parentheses", bestPracticeTitle: "Valid Parentheses" },
  { id: "segmenttree", name: "Segment Tree & BIT", difficulty: "Advanced", briefDesc: "Advanced segment range queries and array point update structures.", subtopics: ["Range Sum Query", "Lazy Propagation", "Fenwick Tree"], bestPracticeId: "two-sum", bestPracticeTitle: "Two Sum" }
];

export const DsaRoadmap: React.FC<DsaRoadmapProps> = ({ setCurrentPage, onSelectProblem }) => {
  const [dbProgress, setDbProgress] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(ROADMAP_TOPICS[0]);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  // AI Tutor variables
  const [tutorMessage, setTutorMessage] = useState<string>("");
  const [tutorOutput, setTutorOutput] = useState<string>("");
  const [isTutorLoading, setIsTutorLoading] = useState<boolean>(false);
  const [tutorChannel, setTutorChannel] = useState<string>("Beginner Mode");

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/dsa/progress", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        setDbProgress(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getTopicStatus = (topicId: string) => {
    const match = dbProgress.find(p => p.topicId === topicId);
    return match ? match.status : "Not Started";
  };

  const changeStatus = async (topicId: string, nextStatus: "In Progress" | "Completed" | "Not Started") => {
    try {
      setIsUpdatingId(topicId);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/dsa/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ topicId, status: nextStatus })
      });
      if (res.ok) {
        await loadProgress();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingId(null);
    }
  };

  const contactTutor = async (promptText?: string) => {
    const query = promptText || tutorMessage;
    if (!query.trim()) return;

    setIsTutorLoading(true);
    setTutorOutput("");
    if (!promptText) setTutorMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ prompt: query, mode: tutorChannel })
      });
      if (res.ok) {
        const data = await res.json();
        setTutorOutput(data.responseText);
      } else {
        setTutorOutput("Tutor is resting. Please try to re-query.");
      }
    } catch (e: any) {
      setTutorOutput("Connection error. CBM checks are active.");
    } finally {
      setIsTutorLoading(false);
    }
  };

  const progressPercent = Math.round(
    (dbProgress.filter(p => p.status === "Completed").length / ROADMAP_TOPICS.length) * 100
  );

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-8 px-4 md:px-8 font-sans" id="dsa-learning-campus">
      <div className="max-w-7xl mx-auto flex flex-col h-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-5 mb-8 gap-4">
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => setCurrentPage("dashboard")}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer animate-pulse"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">Dynamic Curriculums</span>
              <h1 className="text-2xl font-black text-white">DSA Learning Campus</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-slate-400 text-xs font-semibold block">Topics Mastery:</span>
              <span className="font-mono text-sm font-extrabold text-white">{dbProgress.filter(p => p.status === "Completed").length} / {ROADMAP_TOPICS.length}</span>
            </div>
            
            <div className="w-24 bg-slate-900 h-2 rounded-full border border-slate-800 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Triple Section Layout (Tiers selection left, expanded middle, AI tutor helper right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Tiers Left */}
          <div className="lg:col-span-4 space-y-4">
            {["Beginner", "Intermediate", "Advanced"].map((tier) => (
              <div key={tier} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4.5 shadow-md">
                <span className={`text-[10px] font-bold uppercase tracking-wider block mb-3 ${
                  tier === "Beginner" ? "text-emerald-400" :
                  tier === "Intermediate" ? "text-amber-400" :
                  "text-indigo-400"
                }`}>
                  {tier} Concepts
                </span>

                <div className="space-y-2">
                  {ROADMAP_TOPICS.filter(t => t.difficulty === tier).map((top) => {
                    const status = getTopicStatus(top.id);
                    const isSelected = selectedTopic?.id === top.id;
                    return (
                      <button
                        key={top.id}
                        onClick={() => {
                          setSelectedTopic(top);
                          // Prep tutor query
                          setTutorOutput("");
                        }}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected 
                            ? "bg-slate-950 border-indigo-700/60 shadow-lg" 
                            : "bg-slate-900/60 border-slate-850 hover:bg-slate-850"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          {status === "Completed" ? (
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                          ) : status === "In Progress" ? (
                            <Clock className="h-4 w-4 text-amber-500 animate-spin" style={{ animationDuration: "12s" }} />
                          ) : (
                            <div className="h-3.5 w-3.5 rounded-full border border-slate-700 bg-slate-950" />
                          )}
                          <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-300"}`}>{top.name}</span>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Conceptual Arena Middle */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg min-h-[440px] flex flex-col justify-between">
            {selectedTopic ? (
              <div className="space-y-5">
                {/* Topic brief */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase">{selectedTopic.difficulty} CHECKPOINT</span>
                    <h2 className="text-lg font-black text-white mt-1">{selectedTopic.name}</h2>
                  </div>

                  {/* Status switches */}
                  <select
                    value={getTopicStatus(selectedTopic.id)}
                    onChange={(e) => changeStatus(selectedTopic.id, e.target.value as any)}
                    disabled={isUpdatingId !== null}
                    className="bg-slate-950 border border-slate-800 text-[10px] uppercase tracking-wide font-extrabold text-slate-350 rounded-lg px-2 py-1.5 cursor-pointer"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Sub-text */}
                <p className="text-xs text-slate-300 leading-relaxed font-sans italic bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                  {selectedTopic.briefDesc}
                </p>

                {/* Checklist subtopics */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">Key Sub-Concepts Checklist:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs text-slate-350">
                    {selectedTopic.subtopics.map((st, sI) => (
                      <div key={sI} className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-indigo-400/80" />
                        <span>{st}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Integration problem reference */}
                <div className="bg-indigo-950/30 border border-indigo-900/40 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold block">Recommended Arena Exercise</span>
                    <span className="text-xs font-extrabold text-slate-100 mt-1 block">{selectedTopic.bestPracticeTitle}</span>
                  </div>

                  <button
                    onClick={() => {
                      if (onSelectProblem) onSelectProblem(selectedTopic.bestPracticeId);
                      setCurrentPage("playground");
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Open Editor
                  </button>
                </div>

                {/* Fast prompt prep */}
                <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5">
                  <span className="text-[10px] block text-slate-500 w-full mb-1">Quick-query assistant hints:</span>
                  <button
                    onClick={() => contactTutor(`Please explain the concept and main use-cases of "${selectedTopic.name}" with real complexity indices.`)}
                    className="bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-indigo-400 border border-slate-850 rounded text-[10px] px-2 py-1 transition-all"
                  >
                    Explain use-cases 🔍
                  </button>
                  <button
                    onClick={() => contactTutor(`Analyze common interview pitfalls in "${selectedTopic.name}".`)}
                    className="bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-indigo-400 border border-slate-850 rounded text-[10px] px-2 py-1 transition-all"
                  >
                    Interview pitfalls ⚠️
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-20 text-center text-xs">
                <BookOpen className="h-8 w-8 text-slate-700 mb-3" />
                <span>Select a topic to study its blueprints</span>
              </div>
            )}
          </div>

          {/* AI Learning Assistant Right (Feature 4 Integration) */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800/80 rounded-2xl p-4.5 shadow-lg flex flex-col justify-between min-h-[440px]">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-extrabold text-white">AI Tutor Assistant</span>
                </div>

                <select
                  value={tutorChannel}
                  onChange={(e) => setTutorChannel(e.target.value)}
                  className="bg-slate-950 text-[9px] uppercase tracking-wider font-extrabold border border-indigo-900/40 text-indigo-400 rounded px-1.5 py-0.5"
                >
                  <option value="Beginner Mode">Student</option>
                  <option value="Interview Mode">Interview</option>
                  <option value="Competitive Mode">CP Master</option>
                </select>
              </div>

              {/* Chat replies */}
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 h-[255px] overflow-y-auto text-xs leading-relaxed font-sans shadow-inner">
                {isTutorLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-500 space-y-2">
                    <div className="animate-spin h-3.5 w-3.5 border-b border-indigo-500 rounded-full" />
                    <span>Gemini is compiling visual answer...</span>
                  </div>
                ) : tutorOutput ? (
                  <div className="text-slate-300 whitespace-pre-wrap font-sans block-markdown">
                    {tutorOutput}
                  </div>
                ) : (
                  <div className="text-slate-600 italic text-center py-10 flex flex-col items-center justify-center gap-2">
                    <MessageSquare className="h-5 w-5 text-slate-800" />
                    <span>Ask me anything regarding DSA, space indexes, complexities, or ask for micro explanations above! Responses are fully cached for cost optimize patterns.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Prompt send wrapper */}
            <div className="flex items-center space-x-1.5 border-t border-slate-800 pt-3 mt-4">
              <input
                type="text"
                value={tutorMessage}
                onChange={(e) => setTutorMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") contactTutor();
                }}
                placeholder="Ask explanation..."
                className="flex-1 bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-sans focus:border-indigo-500 outline-none"
              />
              <button
                onClick={() => contactTutor()}
                className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-all cursor-pointer"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

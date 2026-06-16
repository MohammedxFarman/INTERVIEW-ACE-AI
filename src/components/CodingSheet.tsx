/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  CheckCircle, 
  HelpCircle, 
  AlertCircle, 
  Code, 
  ArrowLeft, 
  Award,
  Bookmark,
  ChevronDown,
  Lock,
  Compass
} from "lucide-react";

interface CodingSheetProps {
  setCurrentPage: (page: string) => void;
  onSelectProblem?: (id: string) => void;
}

interface SheetQuestion {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: "Arrays" | "Strings" | "Stacks" | "Linked Lists" | "Trees" | "Dynamic Programming";
  leetcodeUrl?: string;
  playgroundAvailable: boolean;
}

const SHEET_QUESTIONS: SheetQuestion[] = [
  // Arrays
  { id: "two-sum", title: "Two Sum", difficulty: "Easy", category: "Arrays", playgroundAvailable: true },
  { id: "best-time-stock", title: "Best Time to Buy and Sell Stock", difficulty: "Easy", category: "Arrays", playgroundAvailable: false },
  { id: "container-water", title: "Container With Most Water", difficulty: "Medium", category: "Arrays", playgroundAvailable: false },
  { id: "product-except-self", title: "Product of Array Except Self", difficulty: "Medium", category: "Arrays", playgroundAvailable: false },
  
  // Strings
  { id: "valid-anagram", title: "Valid Anagram", difficulty: "Easy", category: "Strings", playgroundAvailable: false },
  { id: "longest-substring-without-repeating", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", category: "Strings", playgroundAvailable: false },
  { id: "group-anagrams", title: "Group Anagrams", difficulty: "Medium", category: "Strings", playgroundAvailable: false },
  
  // Stacks
  { id: "valid-parentheses", title: "Valid Parentheses", difficulty: "Easy", category: "Stacks", playgroundAvailable: true },
  { id: "min-stack", title: "Min Stack", difficulty: "Medium", category: "Stacks", playgroundAvailable: false },
  
  // Linked Lists
  { id: "reverse-list", title: "Reverse Linked List", difficulty: "Easy", category: "Linked Lists", playgroundAvailable: true },
  { id: "merge-two-sorted", title: "Merge Two Sorted Lists", difficulty: "Easy", category: "Linked Lists", playgroundAvailable: false },
  { id: "linked-list-cycle", title: "Linked List Cycle", difficulty: "Easy", category: "Linked Lists", playgroundAvailable: false },
  
  // Trees
  { id: "invert-binary-tree", title: "Invert Binary Tree", difficulty: "Easy", category: "Trees", playgroundAvailable: false },
  { id: "max-depth-binary-tree", title: "Maximum Depth of Binary Tree", difficulty: "Easy", category: "Trees", playgroundAvailable: false },
  { id: "lca-binary-tree", title: "Lowest Common Ancestor of a BST", difficulty: "Easy", category: "Trees", playgroundAvailable: false },
  
  // Dynamic Programming
  { id: "climbing-stairs", title: "Climbing Stairs", difficulty: "Easy", category: "Dynamic Programming", playgroundAvailable: false },
  { id: "coin-change", title: "Coin Change", difficulty: "Medium", category: "Dynamic Programming", playgroundAvailable: false }
];

export const CodingSheet: React.FC<CodingSheetProps> = ({ setCurrentPage, onSelectProblem }) => {
  const [sheetProgresses, setSheetProgresses] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/dsa/sheets", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        setSheetProgresses(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getQuestionStatus = (qId: string) => {
    const match = sheetProgresses.find(p => p.questionId === qId);
    return match ? match.status : "Not Solved";
  };

  const updateStatus = async (qId: string, status: "Solved" | "Attempted" | "Revision Needed") => {
    try {
      setIsSyncing(qId);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/dsa/sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ questionId: qId, status })
      });
      if (res.ok) {
        await loadProgress();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(null);
    }
  };

  const categories = ["All", "Arrays", "Strings", "Stacks", "Linked Lists", "Trees", "Dynamic Programming"];

  // Compute metrics
  const solvedCount = sheetProgresses.filter(p => p.status === "Solved").length;
  const attemptedCount = sheetProgresses.filter(p => p.status === "Attempted").length;
  const revisionCount = sheetProgresses.filter(p => p.status === "Revision Needed").length;

  const filteredQuestions = activeCategory === "All" 
    ? SHEET_QUESTIONS 
    : SHEET_QUESTIONS.filter(q => q.category === activeCategory);

  return (
    <div className="bg-transparent text-slate-900 dark:text-slate-100 min-h-[calc(100vh-65px)] py-8 px-4 md:px-8 font-sans" id="coding-sheet-view">
      <div className="max-w-7xl mx-auto flex flex-col h-full">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800/60 pb-5 mb-8 gap-4">
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => setCurrentPage("dashboard")}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-bold">Curated Worksheets</span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">Top 100 Coding Sheet</h1>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-805 font-mono text-[9.5px] shadow-sm">
            <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900/10 px-2 py-1 rounded-lg font-bold">Solved: {solvedCount}</span>
            <span className="bg-amber-50 dark:bg-amber-955/40 text-amber-600 dark:text-amber-500 border border-amber-250 dark:border-amber-900/10 px-2 py-1 rounded-lg font-bold">Attempted: {attemptedCount}</span>
            <span className="bg-red-50 dark:bg-red-955/40 text-red-650 dark:text-red-500 border border-red-250 dark:border-red-900/10 px-2 py-1 rounded-lg font-bold">Revision: {revisionCount}</span>
          </div>
        </div>

        {/* Category horizontal filters */}
        <div className="flex flex-wrap gap-2.5 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat 
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" 
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Table representation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-805 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Question description</span>
            <div className="flex items-center space-x-12.5 text-right mr-4 leading-none">
              <span className="w-20 text-center">Status</span>
              <span className="w-16 text-center">Difficulty</span>
              <span className="w-16 text-center">Workspace</span>
            </div>
          </div>

          <div className="divide-y divide-slate-150 dark:divide-slate-850">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-10 text-xs italic text-slate-500 dark:text-slate-550 font-mono bg-white dark:bg-slate-900">
                No matching target sheet metrics available
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const status = getQuestionStatus(q.id);
                return (
                  <div key={q.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50 dark:hover:bg-slate-850/20 transition-all gap-3.5 bg-white dark:bg-slate-900">
                    
                    <div className="flex items-start space-x-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{q.title}</h3>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-950/65 font-mono text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-850">{q.category}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block font-mono">Question reference checklist identifier: #{q.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center self-end sm:self-center justify-between sm:justify-end gap-6.5">
                      {/* Status select dropdown */}
                      <select
                        value={status}
                        onChange={(e) => updateStatus(q.id, e.target.value as any)}
                        disabled={isSyncing === q.id}
                        className={`text-[10px] uppercase font-mono tracking-wider font-extrabold px-2.2 py-1 rounded-lg border text-center cursor-pointer outline-none ${
                          status === "Solved" ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900/30" :
                          status === "Attempted" ? "bg-amber-50 dark:bg-amber-955/30 text-amber-600 dark:text-amber-500 border-amber-250 dark:border-amber-900/30" :
                          status === "Revision Needed" ? "bg-red-50 dark:bg-red-955/30 text-red-650 dark:text-red-500 border-red-250 dark:border-red-900/30" :
                          "bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <option value="Not Solved" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Not Solved</option>
                        <option value="Solved" className="bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400">Solved</option>
                        <option value="Attempted" className="bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400">Attempted</option>
                        <option value="Revision Needed" className="bg-white dark:bg-slate-900 text-red-650 dark:text-red-450">Revision</option>
                      </select>

                      {/* Difficulty label */}
                      <span className={`w-14 text-center text-[10px] font-bold uppercase tracking-wider block ${
                        q.difficulty === "Easy" ? "text-emerald-500" :
                        q.difficulty === "Medium" ? "text-amber-550 dark:text-amber-400" :
                        "text-red-500"
                      }`}>
                        {q.difficulty}
                      </span>

                      {/* Playground shortcut */}
                      {q.playgroundAvailable ? (
                        <button
                          onClick={() => {
                            if (onSelectProblem) onSelectProblem(q.id);
                            setCurrentPage("playground");
                          }}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Code className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          disabled
                          title="Playground boilerplate locked for this Blind-75 item."
                          className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-650 p-1.5 rounded-lg cursor-not-allowed"
                        >
                          <Lock className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

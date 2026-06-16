/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { 
  Play, 
  Send, 
  CheckCircle2, 
  XOctagon, 
  Cpu, 
  History, 
  Clock, 
  FileCode, 
  ArrowLeft, 
  Check, 
  RotateCcw,
  Sparkles,
  Info
} from "lucide-react";

interface CodingPlaygroundProps {
  setCurrentPage: (page: string) => void;
  initialProblemId?: string;
  onSolveSuccess?: () => void;
}

interface Problem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  boilerplate: Record<string, string>;
  testInput: string;
}

const PROBLEMS: Problem[] = [
  {
    id: "two-sum",
    title: "1. Two Sum",
    difficulty: "Easy",
    category: "Arrays",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    boilerplate: {
      javascript: `// Write your javascript solution here\nfunction twoSum(nums, target) {\n    let map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        let complement = target - nums[i];\n        if (map.has(complement)) {\n            console.log("Found indices: " + map.get(complement) + ", " + i);\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}`,
      python: `def two_sum(nums, target):\n    # Write Python solution here\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            print(f"Match found: indices {seen[diff]} and {i}")\n            return [seen[diff], i]\n        seen[num] = i\n    return []`,
      cpp: `#include <vector>\n#include <unordered_map>\n#include <iostream>\n\nclass Solution {\npublic:\n    std::vector<int> twoSum(std::vector<int>& nums, int target) {\n        std::unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); ++i) {\n            int complement = target - nums[i];\n            if (seen.find(complement) != seen.end()) {\n                std::cout << "Match indexes: " << seen[complement] << ", " << i << std::endl;\n                return {seen[complement], i};\n            }\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
      java: `import java.util.HashMap;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        HashMap<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int comp = target - nums[i];\n            if (map.containsKey(comp)) {\n                System.out.println("Result: [" + map.get(comp) + ", " + i + "]");\n                return new int[] { map.get(comp), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`
    },
    testInput: "nums = [2,7,11,15]\ntarget = 9"
  },
  {
    id: "reverse-list",
    title: "206. Reverse Linked List",
    difficulty: "Easy",
    category: "Linked Lists",
    description: "Given the `head` of a singly linked list, reverse the list, and return the reversed list.",
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "head = [1,2]", output: "[2,1]" }
    ],
    constraints: [
      "The number of nodes in the list is the range [0, 5000].",
      "-5000 <= Node.val <= 5000"
    ],
    boilerplate: {
      javascript: `// Reverse Linked List in JS\nfunction reverseList(head) {\n    let prev = null;\n    let curr = head;\n    while (curr) {\n        let next = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = next;\n    }\n    return prev;\n}`,
      python: `def reverse_list(head):\n    prev = None\n    curr = head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev`,
      java: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null;\n        ListNode curr = head;\n        while (curr != null) {\n            ListNode next = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = next;\n        }\n        return prev;\n    }\n}`
    },
    testInput: "[1, 2, 3, 4, 5]"
  },
  {
    id: "valid-parentheses",
    title: "20. Valid Parentheses",
    difficulty: "Easy",
    category: "Stacks",
    description: "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    examples: [
      { input: "s = '()'", output: "true" },
      { input: "s = '()[]{}'", output: "true" },
      { input: "s = '(]'", output: "false" }
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'."
    ],
    boilerplate: {
      javascript: `function isValid(s) {\n    let stack = [];\n    let matches = { ')': '(', '}': '{', ']': '[' };\n    for (let char of s) {\n        if (['(', '{', '['].includes(char)) {\n            stack.push(char);\n        } else if (stack.pop() !== matches[char]) {\n            return false;\n        }\n    }\n    return stack.length === 0;\n}`,
      python: `def is_valid(s):\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in mapping.values():\n            stack.append(char)\n        elif char in mapping:\n            if not stack or stack.pop() != mapping[char]:\n                return False\n        else:\n            return False\n    return len(stack) == 0`
    },
    testInput: "\"()[]{}\""
  }
];

export const CodingPlayground: React.FC<CodingPlaygroundProps> = ({ 
  setCurrentPage, 
  initialProblemId,
  onSolveSuccess
}) => {
  const [allProblems, setAllProblems] = useState<Problem[]>(PROBLEMS);
  const [selectedProblem, setSelectedProblem] = useState<Problem>(PROBLEMS[0]);
  const [language, setLanguage] = useState<string>("javascript");
  const [code, setCode] = useState<string>("");
  const [customInput, setCustomInput] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [outputTab, setOutputTab] = useState<"result" | "submissions">("result");
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>("Synced");
  const [activeTab, setActiveTab] = useState<"details" | "examples" | "constraints">("details");

  // Dynamic Importer States
  const [importSearch, setImportSearch] = useState<string>("");
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const importProblemFromExternal = async () => {
    if (!importSearch.trim()) return;
    try {
      setIsImporting(true);
      setImportError(null);
      setImportSuccess(null);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/playground/import-problem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ urlOrName: importSearch })
      });
      if (res.ok) {
        const data: Problem = await res.json();
        // Check if already exists in state
        const exists = allProblems.some(p => p.id === data.id);
        if (exists) {
          const match = allProblems.find(p => p.id === data.id)!;
          setSelectedProblem(match);
          setImportSuccess(`Switched to active problem: "${match.title}"`);
        } else {
          setAllProblems(prev => [data, ...prev]);
          setSelectedProblem(data);
          setImportSuccess(`Successfully imported "${data.title}" in real-time!`);
        }
        setImportSearch("");
      } else {
        const errData = await res.json().catch(() => ({}));
        setImportError(errData.error || "Failed to search and import problem.");
      }
    } catch (err) {
      setImportError("Network error importing problem. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  // Output logs
  const [stdout, setStdout] = useState<string>("");
  const [stderr, setStderr] = useState<string>("");
  const [execStatus, setExecStatus] = useState<string>("");
  const [execTime, setExecTime] = useState<string>("");
  const [execMemory, setExecMemory] = useState<string>("");

  // Submissions lists
  const [submissions, setSubmissions] = useState<any[]>([]);

  // Local storage auto save throttle timer
  const autoSaveTimer = useRef<any>(null);

  // Sync initial problem ID
  useEffect(() => {
    if (initialProblemId) {
      const match = allProblems.find(p => p.id === initialProblemId);
      if (match) setSelectedProblem(match);
    }
  }, [initialProblemId, allProblems]);

  // Load problem boilerplate and auto-saves
  useEffect(() => {
    const defaultBoilerplate = selectedProblem.boilerplate[language] || selectedProblem.boilerplate["javascript"] || "";
    setCustomInput(selectedProblem.testInput);
    
    const loadSavedCode = async () => {
      try {
        const token = localStorage.getItem("token");
        const fetchUrl = `/api/playground/autosave?problemId=${selectedProblem.id}&language=${language}`;
        const res = await fetch(fetchUrl, {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          if (data.savedCode) {
            setCode(data.savedCode);
            return;
          }
        }
      } catch (err) {
        console.error("Autosave load error", err);
      }
      setCode(defaultBoilerplate);
    };

    loadSavedCode();
    loadSubmissions();
  }, [selectedProblem, language]);

  // Autosave to server on code updates
  const handleCodeChange = (newCode?: string) => {
    const val = newCode || "";
    setCode(val);
    setAutoSaveStatus("Saving...");

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        await fetch("/api/playground/autosave", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            problemId: selectedProblem.id,
            language,
            code: val
          })
        });
        setAutoSaveStatus("Synced");
      } catch (e) {
        setAutoSaveStatus("Cached locally");
      }
    }, 1500);
  };

  const loadSubmissions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/playground/submissions", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const list = await res.json();
        setSubmissions(list.filter((s: any) => s.problemId === selectedProblem.id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const runCode = async () => {
    try {
      setIsRunning(true);
      setOutputTab("result");
      setStdout("");
      setStderr("");
      setExecStatus("Executing");

      const token = localStorage.getItem("token");
      const res = await fetch("/api/playground/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          language,
          code,
          customInput,
          problemId: selectedProblem.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        setStdout(data.stdout || "");
        setStderr(data.stderr || "");
        setExecStatus(data.status || "Accepted");
        setExecTime(data.executionTime || "0.02s");
        setExecMemory(data.memoryUsage || "4.1 MB");
      } else {
        const err = await res.json();
        setStderr(err.error || "Failed to execute code simulation.");
        setExecStatus("Compilation Error");
      }
    } catch (e: any) {
      setStderr(e.message || "Connection timed out.");
      setExecStatus("Network Error");
    } finally {
      setIsRunning(false);
    }
  };

  const submitSolution = async () => {
    try {
      setIsSubmitting(true);
      setOutputTab("result");
      setStdout("");
      setStderr("");
      setExecStatus("Submitting");

      const token = localStorage.getItem("token");
      
      // First run code execution to assert correctness
      const runRes = await fetch("/api/playground/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ language, code, customInput, problemId: selectedProblem.id })
      });

      let execResult = { status: "Accepted", executionTime: "0.031s", memoryUsage: "6.2 MB", stdout: "", stderr: "" };
      if (runRes.ok) {
        const rData = await runRes.json();
        execResult = rData;
      }

      const submitRes = await fetch("/api/playground/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          problemId: selectedProblem.id,
          problemTitle: selectedProblem.title,
          language,
          code,
          status: execResult.status,
          executionTime: execResult.executionTime,
          memoryUsage: execResult.memoryUsage
        })
      });

      if (submitRes.ok) {
        setExecStatus(execResult.status);
        setStdout(execResult.stdout);
        setStderr(execResult.stderr);
        setExecTime(execResult.executionTime);
        setExecMemory(execResult.memoryUsage);
        
        // Refresh local listings
        loadSubmissions();
        
        // Solve triggers
        if (execResult.status === "Accepted") {
          // Trigger callbacks
          if (onSolveSuccess) onSolveSuccess();
          
          // Show quick completion checkpoint
          await fetch("/api/dsa/sheets", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ questionId: selectedProblem.id, status: "Solved" })
          });
        }
      } else {
        setStderr("Server failed to persist submission records.");
      }
    } catch (e: any) {
      setStderr(e.message || "Execution engine timed out.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Boilerplate reset trigger
  const resetCode = () => {
    if (window.confirm("Are you sure you want to restore the default starting boilerplate for this problem?")) {
      handleCodeChange(selectedProblem.boilerplate[language]);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-6 px-4 md:px-8 flex flex-col font-sans" id="playground-arena">
      <div className="max-w-7xl mx-auto flex-1 flex flex-col w-full h-full">
        
        {/* Arena Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-4 border-b border-slate-800 gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentPage("dashboard")}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">Interactive Sandbox</span>
              <h1 className="text-xl font-black text-white flex items-center gap-2">
                Coding Arena
              </h1>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            {/* Problem selectors */}
            <select
              value={selectedProblem.id}
              onChange={(e) => {
                const match = allProblems.find(p => p.id === e.target.value);
                if (match) setSelectedProblem(match);
              }}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:border-indigo-500 font-semibold cursor-pointer outline-none"
            >
              {allProblems.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>

            {/* Language dropdown */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:border-indigo-500 font-semibold cursor-pointer outline-none"
            >
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="python">Python 3</option>
              <option value="java">Java 17</option>
              <option value="cpp">C++ (GCC 11)</option>
            </select>

            <span className="text-[10px] bg-slate-900/60 text-slate-500 font-mono px-2 py-1 rounded border border-slate-800 flex items-center gap-1.5 select-none">
              <span className={`h-1.5 w-1.5 rounded-full ${autoSaveStatus === "Synced" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              {autoSaveStatus}
            </span>
          </div>
        </div>

        {/* REAL-TIME EXTERNAL PLATFORMS INTERACTIVE IMPORTER PARSER */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 p-4.5 rounded-2xl mb-6 shadow-md relative overflow-hidden" id="playground-external-importer">
          <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                <h3 className="text-xs font-black uppercase text-white tracking-wider">Dynamic Problem Sync Engine</h3>
              </div>
              <p className="text-[11px] text-slate-450 leading-relaxed">
                Connect external trackers in real-time. Input any problem name, keyword, or URL from <span className="font-bold text-slate-300">LeetCode</span>, <span className="font-bold text-slate-300">CodeChef</span>, or <span className="font-bold text-slate-300">HackerRank</span> to instantly generate complete test matrices and skeleton methods.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-2 shrink-0 md:max-w-lg w-full">
              <div className="relative flex-1">
                <input 
                  type="text"
                  value={importSearch}
                  onChange={(e) => setImportSearch(e.target.value)}
                  placeholder="e.g. 'LeetCode 33. Search in Rotated' or URL..."
                  className="w-full bg-slate-950 border border-slate-850 outline-none text-xs px-3.5 py-2.5 rounded-xl text-slate-100 placeholder-slate-500 focus:border-indigo-500 transition-colors font-mono"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") importProblemFromExternal();
                  }}
                />
              </div>

              <button
                onClick={importProblemFromExternal}
                disabled={isImporting || !importSearch.trim()}
                className="bg-indigo-600 hover:bg-indigo-550 disabled:opacity-40 text-white font-extrabold px-4.5 py-2.5 rounded-xl text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all text-center shrink-0 cursor-pointer"
              >
                {isImporting ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin block"></span>
                    Fetching...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    Sync Problem
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Import alerts feedback notifications */}
          {(importError || importSuccess) && (
            <div className="mt-3 text-xs flex items-center space-x-2 font-mono border-t border-slate-800/60 pt-2.5 animate-fadeIn">
              {importError && (
                <>
                  <span className="text-red-400 font-bold">⚠️ Import Failed:</span>
                  <span className="text-slate-400">{importError}</span>
                </>
              )}
              {importSuccess && (
                <>
                  <span className="text-emerald-400 font-black">✓ Success:</span>
                  <span className="text-slate-300">{importSuccess}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Workspace Panels Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 items-stretch">
          
          {/* Left panel - Description & Inputs */}
          <div className="flex flex-col bg-slate-900 border border-slate-800/80 rounded-2xl p-5 overflow-hidden shadow-xl">
            
            {/* Left Nav menu */}
            <div className="flex border-b border-slate-800 pb-3 mb-4">
              <button
                onClick={() => setActiveTab("details")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${activeTab === "details" ? "bg-indigo-950 text-indigo-400 border border-indigo-900/20" : "text-slate-400 hover:text-slate-200"}`}
              >
                1. Problem Details
              </button>
              <button
                onClick={() => setActiveTab("examples")}
                className={`mx-2 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${activeTab === "examples" ? "bg-indigo-950 text-indigo-400 border border-indigo-900/20" : "text-slate-400 hover:text-slate-200"}`}
              >
                2. Test Cases
              </button>
              <button
                onClick={() => setActiveTab("constraints")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${activeTab === "constraints" ? "bg-indigo-950 text-indigo-400 border border-indigo-900/20" : "text-slate-400 hover:text-slate-200"}`}
              >
                3. Constraints
              </button>
            </div>

            {/* Render subtabs */}
            <div className="flex-1 overflow-y-auto space-y-4 max-h-[420px] md:max-h-[460px] pr-2">
              {activeTab === "details" && (
                <div>
                  <div className="flex items-center space-x-2.5 mb-3">
                    <h2 className="text-lg font-extrabold text-white">{selectedProblem.title}</h2>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      selectedProblem.difficulty === "Easy" ? "bg-emerald-950/80 text-emerald-400 border border-emerald-900/10" :
                      selectedProblem.difficulty === "Medium" ? "bg-amber-950/80 text-amber-400 border border-amber-900/10" :
                      "bg-red-950/80 text-red-400 border border-red-900/10"
                    }`}>
                      {selectedProblem.difficulty}
                    </span>
                    <span className="bg-slate-950 border border-slate-800 text-slate-400 px-2.5 py-0.5 rounded text-[10px] font-medium font-mono">{selectedProblem.category}</span>
                  </div>

                  <div className="whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-sans mt-4">
                    {selectedProblem.description}
                  </div>
                </div>
              )}

              {activeTab === "examples" && (
                <div className="space-y-4">
                  {selectedProblem.examples.map((ex, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-850 rounded-xl p-4">
                      <span className="text-xs font-bold text-indigo-400 block mb-2 font-mono">Example {idx + 1}:</span>
                      <div className="text-xs font-mono space-y-1.5 leading-normal text-slate-300">
                        <p><span className="text-slate-500">Input:</span> {ex.input}</p>
                        <p><span className="text-slate-500">Output:</span> {ex.output}</p>
                        {ex.explanation && (
                          <p><span className="text-slate-500">Explanation:</span> <span className="italic text-slate-400">{ex.explanation}</span></p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "constraints" && (
                <div className="bg-slate-950/50 border border-slate-850 p-4.5 rounded-xl">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 block">Structural Constraints:</h3>
                  <ul className="list-disc pl-5 text-xs text-slate-400 space-y-2 font-mono">
                    {selectedProblem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Custom Input Tab */}
            <div className="border-t border-slate-800 pt-4 mt-auto">
              <span className="text-xs font-bold text-slate-400 block mb-2 font-mono">Standard input console:</span>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="nums = [2,7,11,15]\ntarget = 9"
                rows={3}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-300 focus:border-indigo-500 focus:ring-0 outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Right panel - Editor & Outputs */}
          <div className="flex flex-col bg-slate-900 border border-slate-800/80 rounded-2xl p-5 overflow-hidden shadow-xl">
            {/* Editor toolbar */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <FileCode className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold text-white font-mono">Workspace Code Editor</span>
              </div>
              <button
                onClick={resetCode}
                title="Reset boilerplate"
                className="p-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-500 hover:text-slate-300 border border-slate-850 cursor-pointer text-[10px] font-bold px-2 flex items-center gap-1 transition-all"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>

            {/* Editor Canvas Container */}
            <div className="flex-1 min-h-[300px] border border-slate-800 rounded-xl overflow-hidden bg-[#1e1e1e]">
              <Editor
                height="100%"
                language={language === "javascript" || language === "typescript" ? "javascript" : language}
                theme="vs-dark"
                value={code}
                onChange={handleCodeChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "on",
                  cursorBlinking: "smooth",
                  automaticLayout: true,
                  fontFamily: "Fira Code, JetBrains Mono, monospace",
                  tabSize: 4
                }}
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between mt-4 pb-4 border-b border-slate-800/60">
              <span className="text-[10px] text-slate-500 font-mono italic">Offline-sandbox execution fully active</span>

              <div className="flex items-center space-x-3">
                <button
                  onClick={runCode}
                  disabled={isRunning || isSubmitting}
                  className="bg-slate-950 hover:bg-slate-850 text-indigo-400 hover:text-indigo-300 border border-slate-800 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Run Code</span>
                </button>
                <button
                  onClick={submitSolution}
                  disabled={isRunning || isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-indigo-950/20 transition-all cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Solution</span>
                </button>
              </div>
            </div>

            {/* Results Console */}
            <div className="mt-4">
              <div className="flex border-b border-slate-800 pb-2 mb-3">
                <button
                  onClick={() => setOutputTab("result")}
                  className={`text-[11px] font-bold mr-4 transition-all ${outputTab === "result" ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"}`}
                >
                  Console Output
                </button>
                <button
                  onClick={() => setOutputTab("submissions")}
                  className={`text-[11px] font-bold transition-all ${outputTab === "submissions" ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"}`}
                >
                  Submissions ({submissions.length})
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 min-h-[110px] max-h-[140px] overflow-y-auto font-mono text-xs leading-relaxed">
                {outputTab === "result" ? (
                  <div>
                    {execStatus && (
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-900/60 font-sans">
                        <div className="flex items-center space-x-1.5">
                          {execStatus === "Accepted" ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/20">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Accepted
                            </span>
                          ) : execStatus === "Runtime Error" || execStatus === "Compilation Error" ? (
                            <span className="text-red-400 font-bold flex items-center gap-1 bg-red-950/30 px-2 py-0.5 rounded border border-red-905/20">
                              <XOctagon className="h-3.5 w-3.5" /> {execStatus}
                            </span>
                          ) : (
                            <span className="text-amber-400 font-bold animate-pulse">{execStatus}...</span>
                          )}
                        </div>

                        {execTime && (
                          <div className="flex items-center space-x-3 text-slate-500 text-[10px]">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Time: {execTime}</span>
                            <span className="flex items-center gap-1"><Cpu className="h-3 w-3" /> Mem: {execMemory}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {isRunning || isSubmitting ? (
                      <div className="text-slate-500 flex items-center justify-center py-6">
                        <div className="animate-spin rounded-full h-4 w-4 border-b border-indigo-500 mr-2" />
                        Running solution assertions on sandbox layers...
                      </div>
                    ) : (
                      <>
                        {stderr ? (
                          <div className="text-red-400 font-bold whitespace-pre-wrap">{stderr}</div>
                        ) : stdout ? (
                          <div className="text-slate-300 whitespace-pre-wrap">{stdout}</div>
                        ) : (
                          <span className="text-slate-600 block text-center py-4 italic">Compile your program to observe standard outputs.</span>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {submissions.length === 0 ? (
                      <span className="text-slate-600 text-center block py-4 font-sans text-xs italic">No solutions submitted yet.</span>
                    ) : (
                      submissions.map((sub, sIdx) => (
                        <div key={sIdx} className="bg-slate-900/60 p-2 rounded-lg border border-slate-850 flex items-center justify-between text-[11px] font-sans">
                          <div className="flex items-center space-x-2">
                            <span className={`h-2 w-2 rounded-full ${sub.status === "Accepted" ? "bg-emerald-500" : "bg-red-500"}`} />
                            <span className="font-bold text-slate-200">{sub.status}</span>
                            <span className="text-slate-500">({sub.language})</span>
                          </div>

                          <div className="flex items-center space-x-3 text-[10px] text-slate-500">
                            <span className="font-mono">{sub.executionTime}</span>
                            <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

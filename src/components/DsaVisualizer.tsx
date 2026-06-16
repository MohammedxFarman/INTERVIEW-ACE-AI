/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Search, 
  Settings,
  Tv,
  Sparkles,
  Gauge,
  Trophy,
  Award,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Scale,
  Shuffle,
  X,
  Loader2,
  Brain,
  Download,
  Upload,
  Share2,
  Link
} from "lucide-react";
import { QUIZ_QUESTIONS } from "../data/quizQuestions";
import {
  ALGO_METADATA,
  bubbleSortSnapshots,
  selectionSortSnapshots,
  insertionSortSnapshots,
  quickSortSnapshots,
  mergeSortSnapshots,
  linearSearchSnapshots,
  binarySearchSnapshots
} from "../utils/comparisonAlgorithms";

interface DsaVisualizerProps {
  setCurrentPage: (page: string) => void;
}

type NodeShape = {
  id: number;
  val: number;
  x?: number;
  y?: number;
  left?: number; // children indices
  right?: number;
};

export const DsaVisualizer: React.FC<DsaVisualizerProps> = ({ setCurrentPage }) => {
  const [structure, setStructure] = useState<"stack" | "queue" | "array" | "bst" | "hash_map" | "sliding_window" | "comparison">("stack");
  const [nodes, setNodes] = useState<NodeShape[]>([
    { id: 1, val: 10 },
    { id: 2, val: 20 },
    { id: 3, val: 30 }
  ]);
  const [newValue, setNewValue] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [codeLanguage, setCodeLanguage] = useState<"javascript" | "python" | "java" | "cpp">("javascript");

  // 'Ask AI' Code Explanation States
  const [isAnalyzingCode, setIsAnalyzingCode] = useState<boolean>(false);
  const [codeAnalysisResult, setCodeAnalysisResult] = useState<string | null>(null);
  const [codeAnalysisError, setCodeAnalysisError] = useState<string | null>(null);
  const [selectedSnippet, setSelectedSnippet] = useState<string | null>(null);
  const codePreRef = useRef<HTMLPreElement>(null);

  // Hash Map States
  const [hashBuckets, setHashBuckets] = useState<number[][]>([
    [10, 25],
    [6, 16],
    [],
    [18],
    [14, 29]
  ]);
  const [activeBucketIdx, setActiveBucketIdx] = useState<number | null>(null);
  const [activeChainItemIdx, setActiveChainItemIdx] = useState<number | null>(null);

  // Sliding Window States
  const [slidingArray, setSlidingArray] = useState<number[]>([4, 2, 1, 7, 8, 1, 2, 8, 1, 0]);
  const [windowSize, setWindowSize] = useState<number>(3);
  const [leftPtr, setLeftPtr] = useState<number>(0);
  const [rightPtr, setRightPtr] = useState<number>(2);
  const [maxWindowSum, setMaxWindowSum] = useState<number>(0);
  const [currentWindowSum, setCurrentWindowSum] = useState<number>(0);

  // Stepper & playing states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(800); // ms
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const [traversalLog, setTraversalLog] = useState<string[]>([]);
  const [traversalStep, setTraversalStep] = useState<number>(-1);
  const playInterval = useRef<any>(null);
  const [historyStack, setHistoryStack] = useState<any[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupMessage, setBackupMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleExportSession = () => {
    try {
      const sessionData = {
        structure,
        nodes,
        codeLanguage,
        hashBuckets,
        slidingArray,
        windowSize,
        leftPtr,
        rightPtr,
        maxWindowSum,
        currentWindowSum,
        speed,
        traversalLog,
        quizScore,
        quizAnswers,
        currentQuizIndex,
        quizSubmitted,
        quizCompleted,
        comparisonMode,
        algoLeft,
        algoRight,
        comparisonArray,
        customArrayInput,
        comparisonTarget,
        exportedAt: new Date().toISOString()
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sessionData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `dsa-session-${structure}-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setBackupMessage({ text: "Session configurations exported as JSON!", isError: false });
      setTimeout(() => setBackupMessage(null), 4000);
    } catch (err) {
      console.error("Export failed", err);
      setBackupMessage({ text: "Failed to export configurations.", isError: true });
      setTimeout(() => setBackupMessage(null), 4000);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || typeof parsed !== "object") {
          setBackupMessage({ text: "Invalid file format.", isError: true });
          setTimeout(() => setBackupMessage(null), 4000);
          return;
        }

        if (parsed.structure) setStructure(parsed.structure);
        if (Array.isArray(parsed.nodes)) setNodes(parsed.nodes);
        if (parsed.codeLanguage) setCodeLanguage(parsed.codeLanguage);
        if (Array.isArray(parsed.hashBuckets)) setHashBuckets(parsed.hashBuckets);
        if (Array.isArray(parsed.slidingArray)) setSlidingArray(parsed.slidingArray);
        if (typeof parsed.windowSize === "number") setWindowSize(parsed.windowSize);
        if (typeof parsed.leftPtr === "number") setLeftPtr(parsed.leftPtr);
        if (typeof parsed.rightPtr === "number") setRightPtr(parsed.rightPtr);
        if (typeof parsed.maxWindowSum === "number") setMaxWindowSum(parsed.maxWindowSum);
        if (typeof parsed.currentWindowSum === "number") setCurrentWindowSum(parsed.currentWindowSum);
        if (typeof parsed.speed === "number") setSpeed(parsed.speed);
        if (Array.isArray(parsed.traversalLog)) setTraversalLog(parsed.traversalLog);
        
        if (typeof parsed.quizScore === "number") setQuizScore(parsed.quizScore);
        if (parsed.quizAnswers) setQuizAnswers(parsed.quizAnswers);
        if (typeof parsed.currentQuizIndex === "number") setCurrentQuizIndex(parsed.currentQuizIndex);
        if (typeof parsed.quizSubmitted === "boolean") setQuizSubmitted(parsed.quizSubmitted);
        if (typeof parsed.quizCompleted === "boolean") setQuizCompleted(parsed.quizCompleted);

        if (parsed.comparisonMode) setComparisonMode(parsed.comparisonMode);
        if (parsed.algoLeft) setAlgoLeft(parsed.algoLeft);
        if (parsed.algoRight) setAlgoRight(parsed.algoRight);
        if (Array.isArray(parsed.comparisonArray)) setComparisonArray(parsed.comparisonArray);
        if (typeof parsed.customArrayInput === "string") setCustomArrayInput(parsed.customArrayInput);
        if (typeof parsed.comparisonTarget === "number") setComparisonTarget(parsed.comparisonTarget);

        setBackupMessage({ text: "Session configurations loaded successfully!", isError: false });
        setTimeout(() => setBackupMessage(null), 4000);
      } catch (err) {
        console.error("Import failed", err);
        setBackupMessage({ text: "Syntax error in file.", isError: true });
        setTimeout(() => setBackupMessage(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const [isSharing, setIsSharing] = useState<boolean>(false);
  const [generatedShareUrl, setGeneratedShareUrl] = useState<string | null>(null);

  // Load Shared Session on mount if sharing param exists
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get("share_id") || params.get("share");
    if (!shareId) return;

    const fetchSharedSession = async () => {
      try {
        const res = await fetch(`/api/dsa/share/${shareId}`);
        if (!res.ok) {
          throw new Error("Shared session not found");
        }
        const data = await res.json();
        if (data && data.stateData) {
          const parsed = JSON.parse(data.stateData);
          
          if (parsed.structure) setStructure(parsed.structure);
          if (Array.isArray(parsed.nodes)) setNodes(parsed.nodes);
          if (parsed.codeLanguage) setCodeLanguage(parsed.codeLanguage);
          if (Array.isArray(parsed.hashBuckets)) setHashBuckets(parsed.hashBuckets);
          if (Array.isArray(parsed.slidingArray)) setSlidingArray(parsed.slidingArray);
          if (typeof parsed.windowSize === "number") setWindowSize(parsed.windowSize);
          if (typeof parsed.leftPtr === "number") setLeftPtr(parsed.leftPtr);
          if (typeof parsed.rightPtr === "number") setRightPtr(parsed.rightPtr);
          if (typeof parsed.maxWindowSum === "number") setMaxWindowSum(parsed.maxWindowSum);
          if (typeof parsed.currentWindowSum === "number") setCurrentWindowSum(parsed.currentWindowSum);
          if (typeof parsed.speed === "number") setSpeed(parsed.speed);
          if (Array.isArray(parsed.traversalLog)) setTraversalLog(parsed.traversalLog);
          
          if (typeof parsed.quizScore === "number") setQuizScore(parsed.quizScore);
          if (parsed.quizAnswers) setQuizAnswers(parsed.quizAnswers);
          if (typeof parsed.currentQuizIndex === "number") setCurrentQuizIndex(parsed.currentQuizIndex);
          if (typeof parsed.quizSubmitted === "boolean") setQuizSubmitted(parsed.quizSubmitted);
          if (typeof parsed.quizCompleted === "boolean") setQuizCompleted(parsed.quizCompleted);

          if (parsed.comparisonMode) setComparisonMode(parsed.comparisonMode);
          if (parsed.algoLeft) setAlgoLeft(parsed.algoLeft);
          if (parsed.algoRight) setAlgoRight(parsed.algoRight);
          if (Array.isArray(parsed.comparisonArray)) setComparisonArray(parsed.comparisonArray);
          if (typeof parsed.customArrayInput === "string") setCustomArrayInput(parsed.customArrayInput);
          if (typeof parsed.comparisonTarget === "number") setComparisonTarget(parsed.comparisonTarget);

          setBackupMessage({ text: `Successfully loaded shared session shared by ${data.userName || 'a Candidate'}!`, isError: false });
          setTimeout(() => setBackupMessage(null), 5000);
        }
      } catch (err) {
        console.error("Failed to load shared session", err);
        setBackupMessage({ text: "Could not retrieve the shared visualization session.", isError: true });
        setTimeout(() => setBackupMessage(null), 5000);
      }
    };

    fetchSharedSession();
  }, []);

  const handleShareSession = async () => {
    setIsSharing(true);
    setBackupMessage(null);
    try {
      const sessionData = {
        structure,
        nodes,
        codeLanguage,
        hashBuckets,
        slidingArray,
        windowSize,
        leftPtr,
        rightPtr,
        maxWindowSum,
        currentWindowSum,
        speed,
        traversalLog,
        quizScore,
        quizAnswers,
        currentQuizIndex,
        quizSubmitted,
        quizCompleted,
        comparisonMode,
        algoLeft,
        algoRight,
        comparisonArray,
        customArrayInput,
        comparisonTarget
      };

      const token = localStorage.getItem("token");
      const res = await fetch("/api/dsa/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          structure,
          stateData: JSON.stringify(sessionData)
        })
      });

      if (!res.ok) {
        throw new Error("Server responded with error status");
      }

      const data = await res.json();
      const fullUrl = `${window.location.origin}/dsa-visualizer?share_id=${data.shareId}`;
      setGeneratedShareUrl(fullUrl);

      try {
        await navigator.clipboard.writeText(fullUrl);
        setBackupMessage({ text: "Share link generated and copied to clipboard! 📋", isError: false });
      } catch (clipErr) {
        setBackupMessage({ text: "Share link generated! Copy it from the share widget.", isError: false });
      }
    } catch (err) {
      console.error("Failed to share", err);
      setBackupMessage({ text: "Failed to generate public share URL.", isError: true });
    } finally {
      setIsSharing(false);
    }
  };

  const pushStateSnapshot = () => {
    const snap = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      activeNodeId,
      traversalLog: [...traversalLog],
      leftPtr,
      rightPtr,
      currentWindowSum,
      maxWindowSum,
      hashBuckets: JSON.parse(JSON.stringify(hashBuckets)),
      activeChainItemIdx
    };
    setHistoryStack(prev => [...prev.slice(-99), snap]);
  };

  const handleStepBack = () => {
    if (historyStack.length === 0) return;
    const previous = historyStack[historyStack.length - 1];
    setHistoryStack(prev => prev.slice(0, -1));

    if (previous.nodes) setNodes(previous.nodes);
    setActiveNodeId(previous.activeNodeId);
    if (previous.traversalLog) setTraversalLog(previous.traversalLog);
    if (typeof previous.leftPtr === "number") setLeftPtr(previous.leftPtr);
    if (typeof previous.rightPtr === "number") setRightPtr(previous.rightPtr);
    if (typeof previous.currentWindowSum === "number") setCurrentWindowSum(previous.currentWindowSum);
    if (typeof previous.maxWindowSum === "number") setMaxWindowSum(previous.maxWindowSum);
    if (previous.hashBuckets) setHashBuckets(previous.hashBuckets);
    setActiveChainItemIdx(previous.activeChainItemIdx);
  };

  // Quiz Mode States
  const [rightPaneTab, setRightPaneTab] = useState<"study" | "quiz">("study");
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, { selected: number; correct: boolean }>>({});
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // Comparison Mode States
  const [comparisonMode, setComparisonMode] = useState<"sorting" | "search">("sorting");
  const [algoLeft, setAlgoLeft] = useState<string>("bubble");
  const [algoRight, setAlgoRight] = useState<string>("quick");
  const [comparisonArray, setComparisonArray] = useState<number[]>([15, 8, 24, 5, 12, 32, 20]);
  const [customArrayInput, setCustomArrayInput] = useState<string>("15, 8, 24, 5, 12, 32, 20");
  const [comparisonTarget, setComparisonTarget] = useState<number>(12);
  const [comparisonStep, setComparisonStep] = useState<number>(0);
  const [isPlayingComparison, setIsPlayingComparison] = useState<boolean>(false);
  const playComparisonInterval = useRef<any>(null);

  // Load local restore state if triggered from the Dashboard
  useEffect(() => {
    const restoreRequested = localStorage.getItem("dsa-restore-trigger") === "true";
    if (!restoreRequested) return;

    try {
      const stored = localStorage.getItem("dsa-last-session-snapshot");
      if (stored) {
        const parsed = JSON.parse(stored);
        
        if (parsed.structure) setStructure(parsed.structure);
        if (Array.isArray(parsed.nodes)) setNodes(parsed.nodes);
        if (parsed.codeLanguage) setCodeLanguage(parsed.codeLanguage);
        if (Array.isArray(parsed.hashBuckets)) setHashBuckets(parsed.hashBuckets);
        if (Array.isArray(parsed.slidingArray)) setSlidingArray(parsed.slidingArray);
        if (typeof parsed.windowSize === "number") setWindowSize(parsed.windowSize);
        if (typeof parsed.leftPtr === "number") setLeftPtr(parsed.leftPtr);
        if (typeof parsed.rightPtr === "number") setRightPtr(parsed.rightPtr);
        if (typeof parsed.maxWindowSum === "number") setMaxWindowSum(parsed.maxWindowSum);
        if (typeof parsed.currentWindowSum === "number") setCurrentWindowSum(parsed.currentWindowSum);
        if (typeof parsed.speed === "number") setSpeed(parsed.speed);
        if (Array.isArray(parsed.traversalLog)) setTraversalLog(parsed.traversalLog);

        if (parsed.comparisonMode) setComparisonMode(parsed.comparisonMode);
        if (parsed.algoLeft) setAlgoLeft(parsed.algoLeft);
        if (parsed.algoRight) setAlgoRight(parsed.algoRight);
        if (Array.isArray(parsed.comparisonArray)) setComparisonArray(parsed.comparisonArray);
        if (typeof parsed.customArrayInput === "string") setCustomArrayInput(parsed.customArrayInput);
        if (typeof parsed.comparisonTarget === "number") setComparisonTarget(parsed.comparisonTarget);

        setBackupMessage({ text: "Restored your active session checkpoint from Dashboard!", isError: false });
        setTimeout(() => setBackupMessage(null), 4000);
      }
    } catch (err) {
      console.error("Local recovery session loaded in error", err);
    } finally {
      localStorage.removeItem("dsa-restore-trigger");
    }
  }, []);

  // Track and save the snapshot on important changes
  useEffect(() => {
    const snapshot = {
      structure,
      nodes,
      codeLanguage,
      hashBuckets,
      slidingArray,
      windowSize,
      leftPtr,
      rightPtr,
      maxWindowSum,
      currentWindowSum,
      speed,
      traversalLog,
      comparisonMode,
      algoLeft,
      algoRight,
      comparisonArray,
      customArrayInput,
      comparisonTarget,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem("dsa-last-session-snapshot", JSON.stringify(snapshot));
  }, [
    structure,
    nodes,
    codeLanguage,
    hashBuckets,
    slidingArray,
    windowSize,
    leftPtr,
    rightPtr,
    maxWindowSum,
    currentWindowSum,
    speed,
    traversalLog,
    comparisonMode,
    algoLeft,
    algoRight,
    comparisonArray,
    customArrayInput,
    comparisonTarget
  ]);

  // Clear comparison interval on unmount or when config changes
  useEffect(() => {
    return () => {
      if (playComparisonInterval.current) clearInterval(playComparisonInterval.current);
    };
  }, []);

  // When changing structure/config, stop comparisons
  useEffect(() => {
    setIsPlayingComparison(false);
    if (playComparisonInterval.current) clearInterval(playComparisonInterval.current);
    setComparisonStep(0);
  }, [structure, comparisonMode, algoLeft, algoRight, comparisonArray, comparisonTarget]);

  const leftSnapshots = React.useMemo(() => {
    if (comparisonMode === "sorting") {
      if (algoLeft === "bubble") return bubbleSortSnapshots(comparisonArray);
      if (algoLeft === "selection") return selectionSortSnapshots(comparisonArray);
      if (algoLeft === "insertion") return insertionSortSnapshots(comparisonArray);
      if (algoLeft === "quick") return quickSortSnapshots(comparisonArray);
      if (algoLeft === "merge") return mergeSortSnapshots(comparisonArray);
    } else {
      const sortedClone = [...comparisonArray].sort((a, b) => a - b);
      if (algoLeft === "linear") return linearSearchSnapshots(sortedClone, comparisonTarget);
      if (algoLeft === "binary") return binarySearchSnapshots(sortedClone, comparisonTarget);
    }
    return [];
  }, [comparisonMode, algoLeft, comparisonArray, comparisonTarget]);

  const rightSnapshots = React.useMemo(() => {
    if (comparisonMode === "sorting") {
      if (algoRight === "bubble") return bubbleSortSnapshots(comparisonArray);
      if (algoRight === "selection") return selectionSortSnapshots(comparisonArray);
      if (algoRight === "insertion") return insertionSortSnapshots(comparisonArray);
      if (algoRight === "quick") return quickSortSnapshots(comparisonArray);
      if (algoRight === "merge") return mergeSortSnapshots(comparisonArray);
    } else {
      const sortedClone = [...comparisonArray].sort((a, b) => a - b);
      if (algoRight === "linear") return linearSearchSnapshots(sortedClone, comparisonTarget);
      if (algoRight === "binary") return binarySearchSnapshots(sortedClone, comparisonTarget);
    }
    return [];
  }, [comparisonMode, algoRight, comparisonArray, comparisonTarget]);

  const maxStep = React.useMemo(() => {
    return Math.max(leftSnapshots.length, rightSnapshots.length) - 1;
  }, [leftSnapshots, rightSnapshots]);

  const startComparisonPlay = () => {
    if (isPlayingComparison) {
      setIsPlayingComparison(false);
      if (playComparisonInterval.current) clearInterval(playComparisonInterval.current);
    } else {
      setIsPlayingComparison(true);
      if (playComparisonInterval.current) clearInterval(playComparisonInterval.current);
      
      const currentS = comparisonStep >= maxStep ? 0 : comparisonStep;
      if (currentS === 0) setComparisonStep(0);

      let step = currentS;
      playComparisonInterval.current = setInterval(() => {
        if (step < maxStep) {
          step += 1;
          setComparisonStep(step);
        } else {
          setIsPlayingComparison(false);
          clearInterval(playComparisonInterval.current);
        }
      }, speed);
    }
  };

  // Reset quiz state when selected structure changes
  useEffect(() => {
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setQuizSubmitted(false);
    setQuizScore(0);
    setQuizAnswers({});
    setQuizCompleted(false);
  }, [structure]);

  // Setup initial node tree for BST if chosen
  useEffect(() => {
    resetStructure();
  }, [structure]);

  const resetStructure = () => {
    setIsPlaying(false);
    setActiveNodeId(null);
    setTraversalLog([]);
    setTraversalStep(-1);
    setActiveBucketIdx(null);
    setActiveChainItemIdx(null);
    if (playInterval.current) clearInterval(playInterval.current);

    setIsPlayingComparison(false);
    if (playComparisonInterval.current) clearInterval(playComparisonInterval.current);
    setComparisonStep(0);

    if (structure === "array") {
      setNodes([
        { id: 1, val: 15 },
        { id: 2, val: 8 },
        { id: 3, val: 24 },
        { id: 4, val: 32 }
      ]);
    } else if (structure === "stack") {
      setNodes([
        { id: 1, val: 5 },
        { id: 2, val: 12 },
        { id: 3, val: 18 }
      ]);
    } else if (structure === "queue") {
      setNodes([
        { id: 1, val: 100 },
        { id: 2, val: 200 },
        { id: 3, val: 300 }
      ]);
    } else if (structure === "bst") {
      // Small root representation: Root (20), Left (10), Right (30)
      setNodes([
        { id: 101, val: 20, x: 150, y: 30, left: 102, right: 103 },
        { id: 102, val: 10, x: 80, y: 90 },
        { id: 103, val: 30, x: 220, y: 90 }
      ]);
    } else if (structure === "hash_map") {
      setHashBuckets([
        [10, 25],
        [6, 16],
        [],
        [18],
        [14, 29]
      ]);
      setTraversalLog(["Hash Map initialized. Size: 5 buckets. Collisions resolved dynamically via chain scaling."]);
    } else if (structure === "sliding_window") {
      setSlidingArray([4, 2, 1, 7, 8, 1, 2, 8, 1, 0]);
      setLeftPtr(0);
      setRightPtr(2);
      const initialSlice = [4, 2, 1];
      const initialSum = initialSlice.reduce((a, b) => a + b, 0);
      setCurrentWindowSum(initialSum);
      setMaxWindowSum(initialSum);
      setTraversalLog(["Sliding Window initialized. Track Maximum Subarray Sum of size K in real-time."]);
    }
  };

  // Stack ops
  const handlePush = () => {
    const num = parseInt(newValue);
    if (isNaN(num)) return;
    pushStateSnapshot();
    setNodes(prev => [...prev, { id: Date.now(), val: num }]);
    setNewValue("");
  };

  const handlePop = () => {
    if (nodes.length === 0) return;
    pushStateSnapshot();
    setNodes(prev => prev.slice(0, prev.length - 1));
  };

  // Queue ops
  const handleEnqueue = () => {
    const num = parseInt(newValue);
    if (isNaN(num)) return;
    pushStateSnapshot();
    setNodes(prev => [...prev, { id: Date.now(), val: num }]);
    setNewValue("");
  };

  const handleDequeue = () => {
    if (nodes.length === 0) return;
    pushStateSnapshot();
    setNodes(prev => prev.slice(1));
  };

  // Array ops
  const handleArrayInsert = () => {
    const num = parseInt(newValue);
    if (isNaN(num)) return;
    pushStateSnapshot();
    setNodes(prev => [...prev, { id: Date.now(), val: num }]);
    setNewValue("");
  };

  const handleArrayDeleteAt = (idToDelete: number) => {
    pushStateSnapshot();
    setNodes(prev => prev.filter(n => n.id !== idToDelete));
  };

  // BST ops
  const handleBstInsert = () => {
    const num = parseInt(newValue);
    if (isNaN(num)) return;
    setNewValue("");

    // Simple fixed placement logic for standard root inserts
    if (nodes.length === 0) {
      pushStateSnapshot();
      setNodes([{ id: 201, val: num, x: 150, y: 30 }]);
      return;
    }

    if (nodes.length >= 7) {
      alert("Visualization only supports up to 7 tree items.");
      return;
    }

    pushStateSnapshot();
    const currentTree = [...nodes];
    const root = currentTree[0];
    
    // Auto-arrange 2nd level and 3rd level inserts deterministic slots
    const insertRecursive = (nodeId: number, val: number) => {
      const idx = currentTree.findIndex(n => n.id === nodeId);
      if (idx === -1) return;
      const nodeObj = currentTree[idx];

      if (val < nodeObj.val) {
        if (!nodeObj.left) {
          const newId = Date.now();
          const pX = nodeObj.x || 150;
          const pY = nodeObj.y || 30;
          currentTree[idx].left = newId;
          currentTree.push({
            id: newId,
            val,
            x: pX - 45,
            y: pY + 50
          });
        } else {
          insertRecursive(nodeObj.left, val);
        }
      } else {
        if (!nodeObj.right) {
          const newId = Date.now();
          const pX = nodeObj.x || 150;
          const pY = nodeObj.y || 30;
          currentTree[idx].right = newId;
          currentTree.push({
            id: newId,
            val,
            x: pX + 45,
            y: pY + 50
          });
        } else {
          insertRecursive(nodeObj.right, val);
        }
      }
    };

    insertRecursive(root.id, num);
    setNodes(currentTree);
  };

  // Hash Map Operations
  const handleHashMapInsert = () => {
    const num = parseInt(newValue);
    if (isNaN(num)) return;
    setNewValue("");
    
    const bucketIdx = num % 5;
    const updated = [...hashBuckets];
    if (updated[bucketIdx].length >= 5) {
      setTraversalLog([`Bucket ${bucketIdx} is fully occupied for visualization (max 5 keys per bucket chain).`]);
      return;
    }
    pushStateSnapshot();
    updated[bucketIdx] = [...updated[bucketIdx], num];
    setHashBuckets(updated);
    setTraversalLog([`Key ${num} inserted: calculated hash index (${num} % 5) = Bucket ${bucketIdx}`]);
  };

  const handleHashMapDelete = (bucketIdx: number, valIdx: number) => {
    pushStateSnapshot();
    const updated = [...hashBuckets];
    const removedVal = updated[bucketIdx][valIdx];
    updated[bucketIdx] = updated[bucketIdx].filter((_, idx) => idx !== valIdx);
    setHashBuckets(updated);
    setTraversalLog([`Deleted key ${removedVal} from bucket index ${bucketIdx}.`]);
  };

  // Sliding Window Operations
  const handleSlideStep = () => {
    pushStateSnapshot();
    if (leftPtr + windowSize >= slidingArray.length) {
      // Loop back to start
      setLeftPtr(0);
      setRightPtr(windowSize - 1);
      const slice = slidingArray.slice(0, windowSize);
      const sum = slice.reduce((a, b) => a + b, 0);
      setCurrentWindowSum(sum);
      setMaxWindowSum(sum);
      setTraversalLog([`Restarted: Sliding Window at [0 to ${windowSize - 1}], elements = [${slice.join(", ")}], Sum = ${sum}`]);
      return;
    }

    const nextL = leftPtr + 1;
    const nextR = nextL + windowSize - 1;
    setLeftPtr(nextL);
    setRightPtr(nextR);

    const slice = slidingArray.slice(nextL, nextR + 1);
    const sum = slice.reduce((a, b) => a + b, 0);
    setCurrentWindowSum(sum);

    let isNewMax = false;
    if (sum > maxWindowSum) {
      setMaxWindowSum(sum);
      isNewMax = true;
    }

    setTraversalLog(prev => [
      ...prev,
      `Slanted window right: Range [${nextL} ... ${nextR}], values = [${slice.join(", ")}], Sum = ${sum}${isNewMax ? " (New Max! 🌟)" : ""}`
    ]);
  };

  const handleSlideAutoPlay = () => {
    setIsPlaying(true);
    setLeftPtr(0);
    setRightPtr(windowSize - 1);
    
    const slice = slidingArray.slice(0, windowSize);
    const sum = slice.reduce((a, b) => a + b, 0);
    setCurrentWindowSum(sum);
    setMaxWindowSum(sum);
    setTraversalLog([`Auto Play: Initial window [0 to ${windowSize - 1}], elements = [${slice.join(", ")}], Sum = ${sum}`]);

    let currentL = 0;
    if (playInterval.current) clearInterval(playInterval.current);
    playInterval.current = setInterval(() => {
      if (currentL + windowSize < slidingArray.length) {
        currentL += 1;
        const currentR = currentL + windowSize - 1;
        setLeftPtr(currentL);
        setRightPtr(currentR);
        
        const subSlice = slidingArray.slice(currentL, currentR + 1);
        const subSum = subSlice.reduce((a, b) => a + b, 0);
        setCurrentWindowSum(subSum);
        
        let reachedNewMax = false;
        setMaxWindowSum(prev => {
          if (subSum > prev) {
            reachedNewMax = true;
            return subSum;
          }
          return prev;
        });

        setTraversalLog(prev => [
          ...prev,
          `Indices [${currentL}...${currentR}], elements = [${subSlice.join(", ")}], Sum = ${subSum}${reachedNewMax ? " (New Max! 🌟)" : ""}`
        ]);
      } else {
        setTraversalLog(prev => [...prev, `Completed sliding window search sequence. Ultimate Max Sum was: ${maxWindowSum}! 🎉`]);
        clearInterval(playInterval.current);
        setIsPlaying(false);
      }
    }, speed);
  };

  const handleSlideSizeChange = (val: number) => {
    const k = Math.min(Math.max(val, 2), 5); // constrain K between 2 and 5 for visual beauty
    setWindowSize(k);
    setLeftPtr(0);
    setRightPtr(k - 1);
    const slice = slidingArray.slice(0, k);
    const sum = slice.reduce((a, b) => a + b, 0);
    setCurrentWindowSum(sum);
    setMaxWindowSum(sum);
    setTraversalLog([`Changed window tracker span size K to ${k}. Range reset to [0 ... ${k - 1}]`]);
  };

  // Searches
  const handleSearch = async () => {
    const num = parseInt(searchValue);
    if (isNaN(num)) return;
    setIsPlaying(true);
    setTraversalLog([]);

    if (structure === "hash_map") {
      const bucketIdx = num % 5;
      setTraversalLog([`Hashing value: ${num} % 5 = Bucket ${bucketIdx}`]);
      setActiveBucketIdx(bucketIdx);
      const chain = hashBuckets[bucketIdx];

      let stepIdx = 0;
      setActiveChainItemIdx(null);

      if (playInterval.current) clearInterval(playInterval.current);
      playInterval.current = setInterval(() => {
        if (stepIdx < chain.length) {
          const val = chain[stepIdx];
          setTraversalLog(prev => [...prev, `Checking slot [${stepIdx}] = ${val}`]);
          setActiveChainItemIdx(stepIdx);
          if (val === num) {
            setTraversalLog(prev => [...prev, `Found key ${num} inside Bucket ${bucketIdx} at chain node ${stepIdx}! 🎯`]);
            clearInterval(playInterval.current);
            setIsPlaying(false);
          }
          stepIdx++;
        } else {
          setTraversalLog(prev => [...prev, `Collision trace complete: key ${num} not found in Bucket ${bucketIdx}.`]);
          setActiveChainItemIdx(null);
          clearInterval(playInterval.current);
          setIsPlaying(false);
        }
      }, speed);
      return;
    }

    let steps: number[] = [];
    if (structure === "bst") {
      // Find paths
      const traversePath = (nodeId: number) => {
        const nodeObj = nodes.find(n => n.id === nodeId);
        if (!nodeObj) return;
        steps.push(nodeObj.id);
        if (nodeObj.val === num) return;
        if (num < nodeObj.val && nodeObj.left) traversePath(nodeObj.left);
        else if (num > nodeObj.val && nodeObj.right) traversePath(nodeObj.right);
      };
      if (nodes.length) traversePath(nodes[0].id);
    } else {
      // Linear scan
      steps = nodes.map(n => n.id);
    }

    // Play loop paths
    let curr = 0;
    setActiveNodeId(steps[0]);

    if (playInterval.current) clearInterval(playInterval.current);
    playInterval.current = setInterval(() => {
      curr += 1;
      if (curr < steps.length) {
        const activeId = steps[curr];
        const matchObj = nodes.find(n => n.id === activeId);
        setActiveNodeId(activeId);
        if (matchObj && matchObj.val === num) {
          setTraversalLog(prev => [...prev, `Found key ${num}! 🎯`]);
          clearInterval(playInterval.current);
          setIsPlaying(false);
        }
      } else {
        setTraversalLog(prev => [...prev, `Key not found.`]);
        setActiveNodeId(null);
        clearInterval(playInterval.current);
        setIsPlaying(false);
      }
    }, speed);
  };

  // Simple Traversals
  const handleTraverse = (type: "in" | "pre" | "post") => {
    if (structure !== "bst" || nodes.length === 0) return;
    setIsPlaying(true);
    const steps: NodeShape[] = [];

    const getInorder = (nodeId?: number) => {
      if (!nodeId) return;
      const nodeObj = nodes.find(n => n.id === nodeId);
      if (!nodeObj) return;
      if (type === "pre") steps.push(nodeObj);
      getInorder(nodeObj.left);
      if (type === "in") steps.push(nodeObj);
      getInorder(nodeObj.right);
      if (type === "post") steps.push(nodeObj);
    };

    getInorder(nodes[0].id);

    let currPos = 0;
    setActiveNodeId(steps[0].id);
    setTraversalLog([`Beginning ${type.toUpperCase()}ORDER traversal...`]);

    if (playInterval.current) clearInterval(playInterval.current);
    playInterval.current = setInterval(() => {
      if (currPos < steps.length) {
        const curN = steps[currPos];
        setActiveNodeId(curN.id);
        setTraversalLog(prev => [...prev, `Visited val: ${curN.val}`]);
        currPos += 1;
      } else {
        setTraversalLog(prev => [...prev, `Completed path.`]);
        setActiveNodeId(null);
        clearInterval(playInterval.current);
        setIsPlaying(false);
      }
    }, speed);
  };

  const renderInteractiveCode = () => {
    // Determine active parameters
    const itemsListStr = nodes.map(n => n.val).join(", ") || "empty";
    const topValStr = nodes.length > 0 ? nodes[nodes.length - 1].val.toString() : "null";
    const frontValStr = nodes.length > 0 ? nodes[0].val.toString() : "null";
    const activeVal = newValue.trim() || "X";
    
    // Hash elements
    const hashBucketsStr = hashBuckets.map((b, i) => `Bucket ${i}: [${b.join(", ")}]`).join("\n# ");
    const currentHashMod = newValue.trim() ? (parseInt(newValue.trim()) % 5).toString() : "hash_index";

    // Sliding Window items
    const slidingArrayStr = slidingArray.join(", ");
    const activeSlice = slidingArray.slice(leftPtr, rightPtr + 1).join(", ");

    // Custom code templates depending on structure and codeLanguage
    let codeTemplate = "";

    if (structure === "stack") {
      if (codeLanguage === "javascript") {
        codeTemplate = `// Class representation of LIFO Stack
class Stack {
  constructor() {
    this.items = [{ITEMS_LIST}]; // Active elements
  }

  push(element) {
    this.items.push(element); // Pushed: {NEW_VALUE}
  }

  pop() {
    if (this.isEmpty()) return "Underflow";
    return this.items.pop(); // Removes top LIFO element
  }

  peek() {
    return this.items[this.items.length - 1]; // Current top element: {TOP_VAL}
  }
}`;
      } else if (codeLanguage === "python") {
        codeTemplate = `# Class representation of Stack in Python
class Stack:
    def __init__(self):
        self.items = [{ITEMS_LIST}] # Active elements

    def push(self, item):
        self.items.append(item) # Appending: {NEW_VALUE}

    def pop(self):
        if not self.is_empty():
            return self.items.pop()

    def peek(self):
        return self.items[-1] # Current top element: {TOP_VAL}`;
      } else if (codeLanguage === "java") {
        codeTemplate = `// Stack in Java 17
import java.util.Stack;

class Main {
    public static void main(String[] args) {
        Stack<Integer> st = new Stack<>();
        // Current stack elements: [{ITEMS_LIST}]
        
        st.push({NEW_VALUE}); // Push active operation
        
        System.out.println("Top item: " + st.peek()); // Top: {TOP_VAL}
    }
}`;
      } else {
        codeTemplate = `// Stack in C++ (STL)
#include <stack>
#include <iostream>

int main() {
    std::stack<int> s;
    // Current layout: [{ITEMS_LIST}]
    
    s.push({NEW_VALUE}); // Add element
    
    std::cout << "Top: " << s.top(); // Current: {TOP_VAL}
    return 0;
}`;
      }
    } else if (structure === "queue") {
      if (codeLanguage === "javascript") {
        codeTemplate = `// Queue in JS
class Queue {
  constructor() {
    this.items = [{ITEMS_LIST}]; // Active queue front to rear
  }

  enqueue(val) {
    this.items.push(val); // Added element: {NEW_VALUE}
  }

  dequeue() {
    return this.items.shift(); // Dequeued item: {FRONT_VAL}
  }
}`;
      } else if (codeLanguage === "python") {
        codeTemplate = `# Queue using collections.deque
from collections import deque

# Current state of FIFO Queue
queue = deque([{ITEMS_LIST}])

queue.append({NEW_VALUE}) # Enqueue to rear
front_item = queue.popleft() # Dequeue front: {FRONT_VAL}`;
      } else if (codeLanguage === "java") {
        codeTemplate = `// Queue in Java
import java.util.LinkedList;
import java.util.Queue;

class QueueDemo {
    public static void main(String[] args) {
        Queue<Integer> q = new LinkedList<>();
        // Current: [{ITEMS_LIST}]
        
        q.add({NEW_VALUE}); // Enqueues element
        int front = q.peek(); // Current FRONT: {FRONT_VAL}
    }
}`;
      } else {
        codeTemplate = `// Queue in C++
#include <queue>
#include <iostream>

int main() {
    std::queue<int> q;
    // Loaded indices: [{ITEMS_LIST}]
    
    q.push({NEW_VALUE}); // Insert REAR
    int front = q.front(); // Frontend: {FRONT_VAL}
    return 0;
}`;
      }
    } else if (structure === "array") {
      if (codeLanguage === "javascript") {
        codeTemplate = `// Dynamic Array in JavaScript
let arr = [{ITEMS_LIST}];

// Insertion at back
arr.push({NEW_VALUE}); 

console.log("Size: " + arr.length);`;
      } else if (codeLanguage === "python") {
        codeTemplate = `# Dynamic list arrays in Python
arr = [{ITEMS_LIST}]

# Inline append operation
arr.append({NEW_VALUE})

print("List elements:", arr)`;
      } else if (codeLanguage === "java") {
        codeTemplate = `// ArrayList layout
import java.util.ArrayList;

class ArrayDemo {
    public static void main(String[] args) {
        ArrayList<Integer> arr = new ArrayList<>();
        // Initializer states: [{ITEMS_LIST}]
        
        arr.add({NEW_VALUE}); // Add to tail
    }
}`;
      } else {
        codeTemplate = `// Vector arrays in C++
#include <vector>

int main() {
    std::vector<int> arr = { {ITEMS_LIST} };
    
    arr.push_back({NEW_VALUE}); // Expand capacity
    return 0;
}`;
      }
    } else if (structure === "bst") {
      if (codeLanguage === "javascript") {
        codeTemplate = `// Binary Search Tree Insertion
class Node {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

// Inserting value: {NEW_VALUE}
function insert(root, val) {
  if (!root) return new Node(val);
  if (val < root.val) {
    root.left = insert(root.left, val);
  } else {
    root.right = insert(root.right, val);
  }
  return root;
}`;
      } else if (codeLanguage === "python") {
        codeTemplate = `# Binary Search Tree Python representation
class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

# Active value mapped: {NEW_VALUE}
def insert(root, val):
    if not root:
        return Node(val)
    if val < root.val:
        root.left = insert(root.left, val)
    else:
        root.right = insert(root.right, val)
    return root`;
      } else if (codeLanguage === "java") {
        codeTemplate = `// BST Node structure in Java
class Node {
    int val;
    Node left, right;
    Node(int v) { val = v; }
}

class BinaryTree {
    // Current Insert Value: {NEW_VALUE}
    Node insert(Node root, int val) {
        if (root == null) return new Node(val);
        if (val < root.val) root.left = insert(root.left, val);
        else root.right = insert(root.right, val);
        return root;
    }
}`;
      } else {
        codeTemplate = `// BST recursion structures
struct Node {
    int val;
    Node* left = nullptr;
    Node* right = nullptr;
    Node(int v) : val(v) {}
};

// Insert: {NEW_VALUE}
Node* insert(Node* root, int val) {
    if (!root) return new Node(val);
    if (val < root->val) root->left = insert(root->left, val);
    else root->right = insert(root->right, val);
    return root;
}`;
      }
    } else if (structure === "hash_map") {
      if (codeLanguage === "javascript") {
        codeTemplate = `// Separate chaining hash map bucket insertion
const bucketsCount = 5;

// Hash formula: key % size
function getHash(key) {
  return key % bucketsCount; // {NEW_VALUE} % 5 = {HASH_VAL} (calculated index)
}

// Insert collision chains
function insert(key) {
  const hashIdx = getHash(key);
  // Buckets: {HASH_BUCKETS}
}`;
      } else if (codeLanguage === "python") {
        codeTemplate = `# Collision resolving via Separate Chaining
buckets_count = 5

def get_hash(key):
    return key % buckets_count # {NEW_VALUE} % 5 = {HASH_VAL} (index)

# Current keys in chains:
# {HASH_BUCKETS}`;
      } else if (codeLanguage === "java") {
        codeTemplate = `// Separate chaining in Java Linked List Array
import java.util.LinkedList;

class HashMapChaining {
    int bucketsCount = 5;
    
    int getHash(int key) {
        return key % bucketsCount; // {NEW_VALUE} % 5 = {HASH_VAL} (slot)
    }
    
    // Chains layout: {HASH_BUCKETS}
}`;
      } else {
        codeTemplate = `// Memory chaining tables in C++
#include <vector>
#include <list>

class HashMap {
    int size = 5;
public:
    int getHash(int key) {
        return key % size; // {NEW_VALUE} % 5 = {HASH_VAL}
    }
    // Chains details: {HASH_BUCKETS}
};`;
      }
    } else { // sliding_window
      if (codeLanguage === "javascript") {
        codeTemplate = `// Dynamic Sliding Window Sum Max
const nums = [{SLIDING_ARRAY}];
const k = {WINDOW_SIZE}; // Window width span

// Current Pointer Coordinates:
// left = {LEFT_PTR}, right = {RIGHT_PTR}

// Current Frame content: [{ACTIVE_SLICE}]
// Frame Sum: {CURRENT_SUM} | Historical Max Sum: {MAX_SUM}

function maxSubarray(arr, k) {
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += arr[i];
  let maxSum = windowSum;

  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }
  return maxSum;
}`;
      } else if (codeLanguage === "python") {
        codeTemplate = `# Sliding window tracking maximum subarray
nums = [{SLIDING_ARRAY}]
k = {WINDOW_SIZE} # Frame span width

# Pointers coords: left = {LEFT_PTR}, right = {RIGHT_PTR}
# Active Window: [{ACTIVE_SLICE}] | Sum: {CURRENT_SUM}
# Global Max Sum: {MAX_SUM}

def max_subarray(arr, k):
    cur_sum = sum(arr[:k])
    max_sum = cur_sum
    for i in range(k, len(arr)):
        cur_sum += arr[i] - arr[i-k]
        max_sum = max(max_sum, cur_sum)
    return max_sum`;
      } else if (codeLanguage === "java") {
        codeTemplate = `// Main sliding array sequence
class Solution {
    public int maxSubarray(int[] nums, int k) {
        // Elements: [{SLIDING_ARRAY}]
        // Pointer offset: Left = {LEFT_PTR}, Right = {RIGHT_PTR}
        // Frame: [{ACTIVE_SLICE}]
        // Sums: current = {CURRENT_SUM}, max = {MAX_SUM}, K = {WINDOW_SIZE}
        
        int sum = 0;
        for (int i = 0; i < k; i++) sum += nums[i];
        int max = sum;
        return max;
    }
}`;
      } else {
        codeTemplate = `// Sliding window C++ optimization
#include <vector>
#include <algorithm>

int maxSubarray(const std::vector<int>& nums, int k) {
    // Current slide bounds: L = {LEFT_PTR}, R = {RIGHT_PTR}, K = {WINDOW_SIZE}
    // Window: [{ACTIVE_SLICE}]
    // Sum tracker: current = {CURRENT_SUM}, max = {MAX_SUM}
    
    int curSum = 0;
    return curSum;
}`;
      }
    }

    // Replace function to produce formatted elements
    const placeholders: { [key: string]: React.ReactNode } = {
      "{ITEMS_LIST}": <span className="bg-indigo-950 text-indigo-400 font-extrabold px-1 py-0.2 mx-0.5 rounded border border-indigo-900/60 transition-colors" key="items-list">{itemsListStr}</span>,
      "{NEW_VALUE}": <span className="bg-amber-950 text-amber-400 font-black px-1.5 py-0.5 mx-0.5 rounded border border-amber-900/60 animate-pulse" key="new-value">{activeVal}</span>,
      "{TOP_VAL}": <span className="bg-teal-950 text-teal-400 font-extrabold px-1 py-0.2 mx-0.5 rounded border border-teal-900/60" key="top-val">{topValStr}</span>,
      "{FRONT_VAL}": <span className="bg-teal-950 text-teal-400 font-extrabold px-1 py-0.2 mx-0.5 rounded border border-teal-900/60" key="front-val">{frontValStr}</span>,
      "{HASH_VAL}": <span className="bg-indigo-950 text-indigo-400 font-bold px-1 py-0.2 mx-0.5 rounded border border-indigo-900/60" key="hash-val">{currentHashMod}</span>,
      "{HASH_BUCKETS}": <span className="text-slate-400 italic block pl-4 text-[10px] whitespace-pre-line" key="hash-buckets">{hashBucketsStr}</span>,
      "{SLIDING_ARRAY}": <span className="bg-slate-900 text-slate-350 px-1 py-0.2 rounded" key="sliding-array">{slidingArrayStr}</span>,
      "{WINDOW_SIZE}": <span className="bg-indigo-950 text-indigo-400 font-black px-1.5 py-0.5 mx-0.5 rounded border border-indigo-900/40 text-[10px]" key="window-size">{windowSize}</span>,
      "{LEFT_PTR}": <span className="bg-purple-950 text-purple-400 font-black px-1.5 py-0.5 mx-0.5 rounded border border-purple-900/40 text-[10px]" key="left-ptr">{leftPtr}</span>,
      "{RIGHT_PTR}": <span className="bg-emerald-950 text-emerald-400 font-black px-1.5 py-0.5 mx-0.5 rounded border border-emerald-900/40 text-[10px]" key="right-ptr">{rightPtr}</span>,
      "{ACTIVE_SLICE}": <span className="bg-indigo-950 text-indigo-300 font-black px-1.5 py-0.2 mx-0.5 rounded border border-indigo-800/40" key="active-slice">{activeSlice || "empty"}</span>,
      "{CURRENT_SUM}": <span className="text-indigo-400 font-black font-mono px-1 py-0.5 rounded bg-indigo-950 border border-indigo-900/40" key="current-sum">{currentWindowSum}</span>,
      "{MAX_SUM}": <span className="text-amber-400 font-black animate-pulse font-mono px-1 py-0.5 rounded bg-amber-950 border border-amber-900/40" key="max-sum">{maxWindowSum}</span>
    };

    // Parse the template and render elements
    let parts: React.ReactNode[] = [codeTemplate];

    Object.keys(placeholders).forEach((key) => {
      const newParts: React.ReactNode[] = [];
      parts.forEach((p) => {
        if (typeof p === "string") {
          const split = p.split(key);
          split.forEach((seg, sIdx) => {
            newParts.push(seg);
            if (sIdx < split.length - 1) {
              newParts.push(React.cloneElement(placeholders[key] as React.ReactElement, { key: `${key}-${sIdx}` }));
            }
          });
        } else {
          newParts.push(p);
        }
      });
      parts = newParts;
    });

    return parts;
  };

  const handleExplainHighlightedCode = async () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    
    let targetCode = "";
    let modeLabel = "";
    
    if (selectedText) {
      targetCode = selectedText;
      modeLabel = "Highlighted Snippet";
    } else {
      // Fall back to entire pre block code
      targetCode = codePreRef.current?.textContent?.trim() || "";
      modeLabel = "Full Code Template";
    }

    if (!targetCode) {
      setCodeAnalysisError("Could not find any code text to analyze.");
      return;
    }

    setSelectedSnippet(targetCode);
    setIsAnalyzingCode(true);
    setCodeAnalysisResult(null);
    setCodeAnalysisError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          prompt: `Explain the technical implementation under state parameters for the following code snippet. Explain line by line what's happening or summarize the selected logic in relation to DSA.
          
          Selected Context (${modeLabel}):
          \`\`\`${codeLanguage}
          ${targetCode}
          \`\`\`
          
          Keep explanations highly targeted, visual, and concise. Format using Markdown bullet points or numbered sections.`,
          mode: "Technical Tutoring"
        })
      });

      if (!response.ok) {
        throw new Error(`Proxy response error status: ${response.status}`);
      }

      const data = await response.json();
      if (data.responseText) {
        setCodeAnalysisResult(data.responseText);
      } else {
        throw new Error("No response string from tutor server.");
      }
    } catch (err: any) {
      console.error("AI Code Explanation Fetch Error:", err);
      setCodeAnalysisError(err?.message || "Tutor API is currently offline. Please try again soon.");
    } finally {
      setIsAnalyzingCode(false);
    }
  };

  const renderExplanationText = (text: string) => {
    return text.split("\n").map((line, idx) => {
      let lineContent: React.ReactNode = line;
      
      // Simple bold markdown parser (**bold text**)
      if (line.includes("**")) {
        const parts = line.split("**");
        lineContent = parts.map((part, i) => {
          if (i % 2 === 1) {
            return <strong key={i} className="text-white font-extrabold">{part}</strong>;
          }
          return part;
        });
      }

      // Handles inline code highlights (`code`)
      if (typeof lineContent === "string" && lineContent.includes("`")) {
        const parts = lineContent.split("`");
        lineContent = parts.map((part, i) => {
          if (i % 2 === 1) {
            return <code key={i} className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-[10px] font-mono text-amber-300">{part}</code>;
          }
          return part;
        });
      } else if (Array.isArray(lineContent)) {
        // If we already split by bold, let's also split each part by code quote
        lineContent = lineContent.map((subPart, i) => {
          if (typeof subPart === "string" && subPart.includes("`")) {
            const parts = subPart.split("`");
            return parts.map((part, j) => {
              if (j % 2 === 1) {
                return <code key={`${i}-${j}`} className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-[10px] font-mono text-amber-300">{part}</code>;
              }
              return part;
            });
          }
          return subPart;
        });
      }

      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <li key={idx} className="ml-4 pl-1 text-[11px] text-slate-305 leading-relaxed mb-1.5 list-none flex items-start space-x-1.5">
            <span className="text-indigo-400 mt-1 shrink-0">•</span>
            <span>{typeof lineContent === "string" ? lineContent.substring(2) : lineContent}</span>
          </li>
        );
      }
      if (line.trim().startsWith("### ")) {
        return (
          <h3 key={idx} className="text-xs font-black text-white mt-4 mb-2 uppercase tracking-wide border-b border-indigo-950 pb-1">
            {line.replace("### ", "")}
          </h3>
        );
      }
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-[11px] text-slate-300 leading-relaxed mb-2">
          {lineContent}
        </p>
      );
    });
  };

  const getBstHeight = (treeNodes: NodeShape[]): number => {
    if (treeNodes.length === 0) return 0;
    const findDepth = (id: number): number => {
      const node = treeNodes.find(n => n.id === id);
      if (!node) return 0;
      const leftDepth = node.left ? findDepth(node.left) : 0;
      const rightDepth = node.right ? findDepth(node.right) : 0;
      return 1 + Math.max(leftDepth, rightDepth);
    };
    return findDepth(treeNodes[0].id);
  };

  const getComplexityStats = () => {
    switch (structure) {
      case "stack": {
        const n = nodes.length;
        return {
          algorithm: "Stack Operations (LIFO)",
          timeBest: "O(1)",
          timeAvg: "O(1)",
          timeWorst: "O(1)",
          spaceWorst: "O(N)",
          liveN: n,
          metrics: [
            { label: "Active Elements (N)", value: n },
            { label: "Push Operation Cost", value: "O(1) [1 step]" },
            { label: "Pop Operation Cost", value: "O(1) [1 step]" },
            { label: "Theoretical Stack Memory", value: `${n * 4} Bytes` },
          ],
          efficiencyText: "Since stack operations only access the top element via pointer offsets, additions and removals run in strict O(1) constant time regardless of stack size."
        };
      }
      case "queue": {
        const n = nodes.length;
        return {
          algorithm: "Queue Operations (FIFO)",
          timeBest: "O(1)",
          timeAvg: "O(1)",
          timeWorst: "O(1)",
          spaceWorst: "O(N)",
          liveN: n,
          metrics: [
            { label: "Queue Length (N)", value: n },
            { label: "Enqueue Operation Cost", value: "O(1) [Constant]" },
            { label: "Dequeue Operation Cost", value: "O(1) [Constant]" },
            { label: "Allocated Items Memory", value: `${n * 4} Bytes` },
          ],
          efficiencyText: "A queue operates purely on the front and rear pointers, ensuring constant time FIFO enqueue/dequeue operations without shifting existing elements."
        };
      }
      case "array": {
        const n = nodes.length;
        const capacity = n === 0 ? 0 : Math.pow(2, Math.ceil(Math.log2(n || 1)));
        return {
          algorithm: "Dynamic Array (Vector/List)",
          timeBest: "O(1)",
          timeAvg: "O(1) Amortized",
          timeWorst: "O(N) (Resizing)",
          spaceWorst: "O(N)",
          liveN: n,
          metrics: [
            { label: "Array Size (N)", value: n },
            { label: "Underlying Capacity", value: `${capacity} slots` },
            { label: "Memory Load Factor", value: n > 0 ? `${Math.round((n / capacity) * 100)}%` : "0%" },
            { label: "Next Resize Trigger", value: n === capacity ? "Next Insert (resizes)" : `At N = ${capacity + 1}` },
          ],
          efficiencyText: `Dynamic arrays double in capacity when full. Insertions are O(1) mostly, but when size (${n}) equals capacity (${capacity}), inserts trigger a copy of all items, resulting in a temporary O(N) overhead.`
        };
      }
      case "bst": {
        const n = nodes.length;
        const h = getBstHeight(nodes);
        const balancedHeight = n > 0 ? Math.ceil(Math.log2(n + 1)) : 0;
        const isSkewed = h === n && n > 2;
        return {
          algorithm: "Binary Search Tree (BST)",
          timeBest: "O(1) (Root node)",
          timeAvg: "O(log N)",
          timeWorst: "O(N) (Skewed Tree)",
          spaceWorst: "O(H) Recursion Stack",
          liveN: n,
          metrics: [
            { label: "BST Node Count (N)", value: n },
            { label: "Computed Tree Height (H)", value: `${h} layers` },
            { label: "Optimal Height (ceil(log2(N+1)))", value: `${balancedHeight} layers` },
            { label: "Balance Status", value: isSkewed ? "Skewed (Linear Chain ⚠️)" : h <= balancedHeight + 1 ? "Optimal Balanced" : "Moderately Unbalanced" },
          ],
          efficiencyText: `With height H = ${h}, searching this tree requires at most H comparisons. Average search time is optimal O(log N), but if unbalanced, operations degrade to O(N) like a standard linked list.`
        };
      }
      case "hash_map": {
        const totalKeys = hashBuckets.reduce((acc, b) => acc + b.length, 0);
        const numBuckets = 5;
        const loadFactor = (totalKeys / numBuckets).toFixed(1);
        const maxChain = Math.max(...hashBuckets.map(b => b.length));
        return {
          algorithm: "Hashing Map (Chaining Resolution)",
          timeBest: "O(1)",
          timeAvg: "O(1 + α)",
          timeWorst: "O(N) (Severe Collisions)",
          spaceWorst: "O(N + B)",
          liveN: totalKeys,
          metrics: [
            { label: "Total Keys Inserted (N)", value: totalKeys },
            { label: "Bucket Slots Count (B)", value: numBuckets },
            { label: "Computed Load Factor (α)", value: `${loadFactor}` },
            { label: "Max Collision Chain Size (L)", value: `${maxChain} items` },
          ],
          efficiencyText: `Key inserts/lookups map to Bucket via Key % 5. The ideal lookup cost is O(1). Due to collisions, a slot has a chain of L = ${maxChain} items. The actual worst-case search cost is O(${maxChain}) comparisons.`
        };
      }
      case "sliding_window": {
        const n = slidingArray.length;
        const k = windowSize;
        const naiveOps = n * k;
        const optimalOps = n + (n - k);
        const speedRatio = (naiveOps / optimalOps).toFixed(1);
        return {
          algorithm: "Sliding Window Maximum Sum",
          timeBest: "O(N)",
          timeAvg: "O(N)",
          timeWorst: "O(N)",
          spaceWorst: "O(1) Auxiliary",
          liveN: n,
          metrics: [
            { label: "Main Array Size (N)", value: n },
            { label: "Window Frame Span (K)", value: k },
            { label: "Naive Operations (N * K)", value: `${naiveOps} steps` },
            { label: "Optimal Window Ops (N + (N-K))", value: `${optimalOps} steps` },
          ],
          efficiencyText: `Without sliding window, recalculating every overlapping frame takes ${naiveOps} operations. The optimal sliding window technique reuses previous calculations in O(N) constant time, requiring only ${optimalOps} steps (${speedRatio}x fewer computations!).`
        };
      }
    }
  };

  const renderComplexityPanel = () => {
    const stats = getComplexityStats();
    if (!stats) return null;

    return (
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between" id="complexity-analyst-panel">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 font-mono">
            <div className="flex items-center space-x-2">
              <Gauge className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Complexity Analysis Panel
              </span>
            </div>
            <span className="bg-indigo-950 text-indigo-400 border border-indigo-900/30 text-[8.5px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {stats.algorithm}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex flex-col justify-between">
              <div>
                <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black block mb-1">Time Complexity</span>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-medium">Best:</span>
                    <span className="text-emerald-400 font-black">{stats.timeBest}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-medium">Average:</span>
                    <span className="text-indigo-400 font-black">{stats.timeAvg}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] border-t border-slate-900 pt-1">
                    <span className="text-slate-400 font-medium">Worst:</span>
                    <span className="text-amber-400 font-black">{stats.timeWorst}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex flex-col justify-between">
              <div>
                <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black block mb-1">Space Complexity</span>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-medium">Max Limit:</span>
                    <span className="text-pink-400 font-black">{stats.spaceWorst}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] border-t border-slate-900 pt-1">
                    <span className="text-slate-400 font-medium">Auxiliary:</span>
                    <span className="text-purple-400 font-black">
                      {structure === "sliding_window" ? "O(1)" : structure === "hash_map" ? "O(B)" : "O(1)"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-[9px] text-slate-500 italic text-center border-t border-slate-900 pt-1 leading-normal">
                {structure === "bst" ? "Call stack space" : "Heap memory blocks"}
              </div>
            </div>
          </div>

          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block mb-2 font-mono">
              Live Algorithmic Calculations:
            </span>
            <div className="space-y-1.5 font-mono">
              {stats.metrics.map((m, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-950/40 px-3 py-1.5 border border-slate-850/60 rounded-xl">
                  <span className="text-[10px] text-slate-450 font-medium">{m.label}</span>
                  <span className="text-[10.5px] text-slate-100 font-black">{m.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 border border-slate-850 rounded-xl leading-relaxed text-[10px]">
            <div className="flex items-start space-x-2">
              <span className="text-indigo-400 select-none text-xs font-bold leading-none mt-0.5">ℹ</span>
              <p className="text-slate-450 font-sans leading-relaxed">
                {stats.efficiencyText}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderQuizPanel = () => {
    const questions = QUIZ_QUESTIONS[structure] || [];
    const activeQuestion = questions[currentQuizIndex];

    const handleSelectOption = (idx: number) => {
      if (quizSubmitted) return;
      setSelectedOption(idx);
    };

    const handleSubmitAnswer = () => {
      if (selectedOption === null || quizSubmitted) return;

      const isCorrect = selectedOption === activeQuestion.correctIndex;
      setQuizAnswers((prev) => ({
        ...prev,
        [currentQuizIndex]: { selected: selectedOption, correct: isCorrect },
      }));

      if (isCorrect) {
        setQuizScore((prev) => prev + 1);
      }

      setQuizSubmitted(true);
    };

    const handleNextQuestion = () => {
      if (currentQuizIndex < questions.length - 1) {
        setCurrentQuizIndex((prev) => prev + 1);
        setSelectedOption(null);
        setQuizSubmitted(false);
      } else {
        setQuizCompleted(true);
        const percentage = Math.round((quizScore / questions.length) * 100);
        if (percentage >= 80) {
          localStorage.setItem("quiz-high-accuracy", "true");
        }
        if (percentage === 100) {
          localStorage.setItem("quiz-perfect-accuracy", "true");
        }
      }
    };

    const handleResetQuiz = () => {
      setCurrentQuizIndex(0);
      setSelectedOption(null);
      setQuizSubmitted(false);
      setQuizScore(0);
      setQuizAnswers({});
      setQuizCompleted(false);
    };

    const friendlyNames: Record<string, string> = {
      stack: "LIFO Stack 🥞",
      queue: "FIFO Queue 👥",
      array: "Dynamic Array 📊",
      bst: "Binary Search Tree 🌳",
      hash_map: "Hashing Map 🗃️",
      sliding_window: "Sliding Window 🪟"
    };

    if (quizCompleted) {
      const percentage = Math.round((quizScore / questions.length) * 100);
      return (
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between" id="quiz-complete-panel">
          <div className="text-center py-6 px-4 space-y-5">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-widest font-black block">Quiz Finished!</span>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">{friendlyNames[structure]} Arena</h3>
            </div>

            <div className="py-4 bg-slate-950/60 border border-slate-850 rounded-2xl max-w-sm mx-auto">
              <div className="text-3xl font-black text-white font-mono">
                {quizScore} <span className="text-slate-500 text-lg">/</span> {questions.length}
              </div>
              <div className="text-xs font-bold text-slate-400 mt-1">
                Completed with <span className="text-indigo-400 font-extrabold">{percentage}% Score</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans max-w-sm mx-auto">
              {percentage === 100 
                ? "Perfect score! You have masterfully proven your understanding of this algorithmic concept! 🌟" 
                : percentage >= 60 
                  ? "Great job! You have a solid grasp on this data structure's mechanisms. 👍" 
                  : "Keep practicing! Take a look at the Interactive Code Companion and visual steps to build stronger foundations. 📚"}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-3 justify-center items-center font-mono">
              <button
                onClick={handleResetQuiz}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-black px-5 py-2.5 rounded-xl text-xs transition-with-duration flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-indigo-950/30"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry Quiz</span>
              </button>
              <button
                onClick={() => setRightPaneTab("study")}
                className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-750 font-black px-5 py-2.5 rounded-xl text-xs transition-with-duration flex items-center justify-center space-x-2 cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Return to Study</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!activeQuestion) {
      return (
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 text-center text-slate-400 font-mono text-xs">
          Loading questions...
        </div>
      );
    }

    return (
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between" id="active-quiz-panel">
        <div className="flex flex-col space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 font-mono">
            <div className="flex items-center space-x-2">
              <HelpCircle className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Quiz Arena: {friendlyNames[structure]}
              </span>
            </div>
            
            <div className="bg-slate-950 text-slate-400 border border-slate-850 text-[9px] px-2.5 py-1 rounded-full font-bold flex items-center space-x-1.5 animate-pulse">
              <span>SCORE:</span> 
              <span className="text-emerald-400 font-black font-mono">{quizScore}</span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 pt-1">
            {questions.map((_, idx) => {
              const ansState = quizAnswers[idx];
              const isActive = idx === currentQuizIndex;
              let dotBg = "bg-slate-950 border-slate-850";
              if (ansState) {
                dotBg = ansState.correct 
                  ? "bg-emerald-600 border-emerald-500 shadow-sm shadow-emerald-950/20" 
                  : "bg-red-650 border-red-500 shadow-sm shadow-red-950/20";
              } else if (isActive) {
                dotBg = "bg-indigo-950 border-indigo-500 ring-2 ring-indigo-500/30";
              }

              return (
                <div
                  key={idx}
                  className={`flex-1 h-1.5 rounded-full border transition-all ${dotBg}`}
                  title={`Question ${idx + 1}`}
                />
              );
            })}
          </div>

          <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center text-[8.5px] font-mono text-slate-500 uppercase tracking-widest font-black">
              <span>Question {currentQuizIndex + 1} of {questions.length}</span>
              <span className="bg-slate-900 border border-slate-850 px-1.5 py-0.2 rounded text-[8px] text-indigo-400 font-black lowercase tracking-widest">Active</span>
            </div>
            <p className="text-slate-100 text-xs font-semibold leading-relaxed font-sans">
              {activeQuestion.question}
            </p>
          </div>

          <div className="space-y-2.5 pt-1.5">
            {activeQuestion.options.map((opt, oIdx) => {
              const isSelected = selectedOption === oIdx;
              const isCorrectO = oIdx === activeQuestion.correctIndex;
              const wasSelectedAndWrong = quizSubmitted && isSelected && !isCorrectO;
              const wasSelectedAndCorrect = quizSubmitted && isSelected && isCorrectO;
              
              let choiceStyle = "bg-slate-900 border-slate-850 hover:bg-slate-950 hover:border-slate-800 text-slate-300";
              let pillBg = "bg-slate-950 border-slate-850 text-slate-500";
              
              if (quizSubmitted) {
                if (isCorrectO) {
                  choiceStyle = "bg-emerald-950/30 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/10";
                  pillBg = "bg-emerald-600 text-white border-transparent";
                } else if (wasSelectedAndWrong) {
                  choiceStyle = "bg-red-950/30 border-red-500 text-red-350 shadow-md shadow-red-950/10";
                  pillBg = "bg-red-650 text-white border-transparent";
                } else {
                  choiceStyle = "bg-slate-950/10 border-slate-900/60 text-slate-650 opacity-60 pointer-events-none";
                  pillBg = "bg-slate-900 text-slate-650 border-slate-900";
                }
              } else if (isSelected) {
                choiceStyle = "bg-indigo-950/40 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/20";
                pillBg = "bg-indigo-600 text-white border-transparent";
              }

              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectOption(oIdx)}
                  disabled={quizSubmitted}
                  className={`w-full text-left px-3.5 py-2.5 border rounded-xl text-[10.5px] leading-relaxed font-medium transition-all flex items-start space-x-3 cursor-pointer ${choiceStyle}`}
                >
                  <span className={`w-5 h-5 rounded-lg border font-mono font-bold text-[9px] flex items-center justify-center select-none flex-shrink-0 ${pillBg}`}>
                    {String.fromCharCode(65 + oIdx)}
                  </span>
                  <span className="font-sans leading-relaxed pt-0.5">{opt}</span>
                </button>
              );
            })}
          </div>

          {quizSubmitted && (
            <div className={`p-3 border rounded-xl text-[10.5px] leading-relaxed font-sans ${
              selectedOption === activeQuestion.correctIndex 
                ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-450" 
                : "bg-red-950/20 border-red-900/40 text-red-355"
            }`}>
              <div className="flex items-start space-x-2">
                <span className="text-lg leading-none select-none">
                  {selectedOption === activeQuestion.correctIndex ? "🎉" : "💡"}
                </span>
                <div className="space-y-1">
                  <span className="font-black text-[9.5px] uppercase tracking-wider block font-mono">
                    {selectedOption === activeQuestion.correctIndex ? "Correct Answer!" : "Incorrect Answer"}
                  </span>
                  <p className="text-slate-350 leading-relaxed text-[10px]">
                    {activeQuestion.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 font-mono">
            {!quizSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="w-full bg-indigo-600 hover:bg-indigo-500 border-t border-indigo-400/25 text-white font-black py-2.5 text-xs rounded-xl shadow-lg shadow-indigo-950/30 transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Submit Answer</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="w-full bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-100 font-extrabold py-2.5 text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>
                  {currentQuizIndex < questions.length - 1 ? "Next Question" : "Complete & View Score"}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

        </div>
      </div>
    );
  };

  const renderComparisonLayout = () => {
    const leftSnap = leftSnapshots[Math.min(comparisonStep, leftSnapshots.length - 1)] || {
      array: comparisonArray,
      activeIndices: [],
      sortedIndices: [],
      pointers: {},
      comparisons: 0,
      swaps: 0,
      log: "Ready",
      done: false
    };

    const rightSnap = rightSnapshots[Math.min(comparisonStep, rightSnapshots.length - 1)] || {
      array: comparisonArray,
      activeIndices: [],
      sortedIndices: [],
      pointers: {},
      comparisons: 0,
      swaps: 0,
      log: "Ready",
      done: false
    };

    const handleGenerateRandomArray = () => {
      const newArr = [];
      for (let i = 0; i < 7; i++) {
        newArr.push(Math.floor(Math.random() * 85) + 10);
      }
      setComparisonArray(newArr);
      setCustomArrayInput(newArr.join(", "));
      setComparisonStep(0);
      setIsPlayingComparison(false);
      if (playComparisonInterval.current) clearInterval(playComparisonInterval.current);
    };

    const handleApplyCustomArray = () => {
      const arr = customArrayInput
        .split(",")
        .map(x => parseInt(x.trim()))
        .filter(x => !isNaN(x) && x > 0 && x <= 200)
        .slice(0, 10);
      if (arr.length > 0) {
        setComparisonArray(arr);
        setCustomArrayInput(arr.join(", "));
        setComparisonStep(0);
        setIsPlayingComparison(false);
        if (playComparisonInterval.current) clearInterval(playComparisonInterval.current);
      } else {
        alert("Please enter a valid comma-separated list of positive integers (e.g. 15, 8, 24, 5). Max length 10.");
      }
    };

    const handleApplyTargetValue = (val: string) => {
      const num = parseInt(val);
      if (!isNaN(num)) {
        setComparisonTarget(num);
        setComparisonStep(0);
        setIsPlayingComparison(false);
        if (playComparisonInterval.current) clearInterval(playComparisonInterval.current);
      }
    };

    const handlePrevStep = () => {
      if (comparisonStep > 0) {
        setComparisonStep(prev => prev - 1);
        setIsPlayingComparison(false);
        if (playComparisonInterval.current) clearInterval(playComparisonInterval.current);
      }
    };

    const handleNextStep = () => {
      if (comparisonStep < maxStep) {
        setComparisonStep(prev => prev + 1);
        setIsPlayingComparison(false);
        if (playComparisonInterval.current) clearInterval(playComparisonInterval.current);
      }
    };

    const handleResetComparison = () => {
      setComparisonStep(0);
      setIsPlayingComparison(false);
      if (playComparisonInterval.current) clearInterval(playComparisonInterval.current);
    };

    const metaLeft = ALGO_METADATA[algoLeft] || {
      name: algoLeft,
      timeBest: "N/A",
      timeAvg: "N/A",
      timeWorst: "N/A",
      space: "N/A",
      desc: ""
    };
    const metaRight = ALGO_METADATA[algoRight] || {
      name: algoRight,
      timeBest: "N/A",
      timeAvg: "N/A",
      timeWorst: "N/A",
      space: "N/A",
      desc: ""
    };

    return (
      <div className="w-full flex flex-col space-y-6 animate-fade-in select-none" id="comparison-arena-layout">
        
        {/* Top visual metadata card */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col space-y-4">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800/60 pb-4 gap-4">
            <div className="flex items-center space-x-2.5">
              <Scale className="h-5 w-5 text-amber-400" />
              <div>
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest font-mono">Dynamic Comparison Engine</span>
                <h2 className="text-lg font-black text-white">Compare Algorithms Side-by-Side</h2>
              </div>
            </div>

            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 self-stretch md:self-auto font-mono">
              <button
                onClick={() => {
                  setComparisonMode("sorting");
                  setAlgoLeft("bubble");
                  setAlgoRight("quick");
                  setComparisonStep(0);
                }}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-black uppercase transition-all tracking-wider cursor-pointer ${
                  comparisonMode === "sorting"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/35"
                    : "text-slate-400 hover:text-indigo-400 hover:bg-slate-900/50"
                }`}
              >
                Sorting Mode 📊
              </button>
              <button
                onClick={() => {
                  setComparisonMode("search");
                  setAlgoLeft("linear");
                  setAlgoRight("binary");
                  setComparisonStep(0);
                }}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-black uppercase transition-all tracking-wider cursor-pointer ${
                  comparisonMode === "search"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/35"
                    : "text-slate-400 hover:text-indigo-400 hover:bg-slate-900/50"
                }`}
              >
                Search Mode 🔍
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center font-mono">
            
            <div className="md:col-span-3 flex flex-col space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Algorithm A (Left):</span>
              <select
                value={algoLeft}
                onChange={(e) => {
                  setAlgoLeft(e.target.value);
                  setComparisonStep(0);
                }}
                className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none font-bold focus:border-indigo-500 w-full"
              >
                {comparisonMode === "sorting" ? (
                  <>
                    <option value="bubble">Bubble Sort</option>
                    <option value="selection">Selection Sort</option>
                    <option value="insertion">Insertion Sort</option>
                    <option value="quick">Quick Sort (Pivot Last)</option>
                    <option value="merge">Merge Sort (Recursive)</option>
                  </>
                ) : (
                  <>
                    <option value="linear">Linear Search</option>
                    <option value="binary">Binary Search</option>
                  </>
                )}
              </select>
            </div>

            <div className="md:col-span-3 flex flex-col space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Algorithm B (Right):</span>
              <select
                value={algoRight}
                onChange={(e) => {
                  setAlgoRight(e.target.value);
                  setComparisonStep(0);
                }}
                className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none font-bold focus:border-indigo-500 w-full"
              >
                {comparisonMode === "sorting" ? (
                  <>
                    <option value="bubble">Bubble Sort</option>
                    <option value="selection">Selection Sort</option>
                    <option value="insertion">Insertion Sort</option>
                    <option value="quick">Quick Sort (Pivot Last)</option>
                    <option value="merge">Merge Sort (Recursive)</option>
                  </>
                ) : (
                  <>
                    <option value="linear">Linear Search</option>
                    <option value="binary">Binary Search</option>
                  </>
                )}
              </select>
            </div>

            <div className="md:col-span-4 flex flex-col space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                {comparisonMode === "search" ? "Target Sorted Array Elements:" : "Unsorted Array Elements:"}
              </span>
              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  value={customArrayInput}
                  onChange={(e) => setCustomArrayInput(e.target.value)}
                  placeholder="e.g. 15, 8, 24, 5, 12, 32"
                  className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-2 py-1.5 text-xs text-white outline-none font-bold focus:border-indigo-500"
                />
                <button
                  onClick={handleApplyCustomArray}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="md:col-span-2 flex items-stretch md:self-end h-9 font-sans mt-3.5 md:mt-0">
              {comparisonMode === "search" ? (
                <div className="flex flex-col space-y-1 w-full font-mono">
                  <span className="text-[9.5px] uppercase font-bold text-slate-500">Target:</span>
                  <input
                    type="number"
                    value={comparisonTarget}
                    onChange={(e) => handleApplyTargetValue(e.target.value)}
                    placeholder="12"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2 py-1 text-xs text-white outline-none font-bold text-center"
                  />
                </div>
              ) : (
                <button
                  onClick={handleGenerateRandomArray}
                  className="w-full bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Shuffle className="h-3.5 w-3.5 text-amber-400" />
                  <span>Randomize</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Global Controller Player Bar */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center space-x-3.5 font-mono">
            <div className="bg-slate-950 border border-slate-850 rounded-xl py-2 px-4.5 text-center">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase block leading-none mb-1">Current Step</span>
              <span className="text-sm font-black text-white">{comparisonStep} <span className="text-[10px] text-slate-650">/ {maxStep}</span></span>
            </div>
            
            <div className="hidden sm:block">
              <span className="text-[10px] text-slate-400 font-bold block">Status Checklist:</span>
              <span className="text-[10.5px] text-slate-300 font-extrabold flex items-center gap-1.5 mt-0.5">
                <span className={`h-2 w-2 rounded-full ${isPlayingComparison ? "bg-emerald-500 animate-pulse" : "bg-slate-550"}`} />
                {comparisonStep === 0 ? "Initial Unsorted Setup" : comparisonStep >= maxStep ? "All execution paths resolved! 🎉" : "Running simulations..."}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 font-mono">
            <button
              onClick={handleResetComparison}
              disabled={comparisonStep === 0}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-850/70 text-slate-400 hover:text-white transition-all cursor-pointer disabled:opacity-40"
              title="Reset Timeline To Start"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={handlePrevStep}
              disabled={comparisonStep === 0}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-850/70 text-slate-400 hover:text-white transition-all cursor-pointer disabled:opacity-40"
              title="Previous Simulation Step"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <button
              onClick={startComparisonPlay}
              className={`p-3.5 rounded-2xl font-black uppercase text-xs flex items-center justify-center space-x-2.5 transition-all shadow-md cursor-pointer ${
                isPlayingComparison 
                  ? "bg-amber-600 text-white shadow-amber-950/20" 
                  : "bg-indigo-600 text-white shadow-indigo-950/25"
              }`}
            >
              {isPlayingComparison ? (
                <>
                  <Pause className="h-4 w-4 text-white" />
                  <span className="px-1 text-[11px] font-black uppercase tracking-wider">Pause Duel</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 text-white" />
                  <span className="px-1 text-[11px] font-black uppercase tracking-wider">Play Duel</span>
                </>
              )}
            </button>

            <button
              onClick={handleNextStep}
              disabled={comparisonStep >= maxStep}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-850/70 text-slate-400 hover:text-white transition-all cursor-pointer disabled:opacity-40"
              title="Next Simulation Step"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto font-mono">
            <div className="flex-grow md:flex-grow-0">
              <span className="text-[10px] font-bold text-slate-500 block uppercase">Playback Delay:</span>
              <input
                type="range"
                min={400}
                max={2000}
                step={200}
                value={speed}
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="w-full md:w-28 accentuate-indigo hover:opacity-100 opacity-80"
              />
            </div>
            <span className="text-[10.5px] font-black text-slate-350">{speed}ms</span>
          </div>

        </div>

        {/* Dual Comparison Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* Panel Alpha */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between min-h-[460px] relative overflow-hidden">
            
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-start border-b border-slate-800/50 pb-3">
                <div>
                  <span className="text-[10px] text-indigo-400 font-extrabold uppercase font-mono tracking-wider">Algorithm Alpha</span>
                  <h3 className="text-base font-black text-white">{metaLeft.name}</h3>
                </div>
                
                <div className="flex flex-wrap gap-1 items-center justify-end">
                  <span className="bg-indigo-950/60 border border-indigo-900/45 text-indigo-300 text-[8.5px] font-black uppercase px-2 py-0.5 rounded-md" title="Average Time Complexity">
                    T(Avg): {metaLeft.timeAvg}
                  </span>
                  <span className="bg-slate-950 border border-slate-850 text-slate-400 text-[8.5px] font-black uppercase px-2 py-0.5 rounded-md" title="Worst-case Time Complexity">
                    T(Worst): {metaLeft.timeWorst}
                  </span>
                  <span className="bg-slate-950 border border-slate-850 text-slate-400 text-[8.5px] font-black uppercase px-2 py-0.5 rounded-md" title="Auxiliary Space Complexity">
                    S(Space): {metaLeft.space}
                  </span>
                </div>
              </div>

              <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed bg-slate-950/30 p-2.5 border border-slate-850/40 rounded-xl italic">
                💡 {metaLeft.desc}
              </p>

              <div className="h-44 flex items-end justify-center p-4 py-8 bg-slate-950 rounded-xl relative overflow-hidden border border-slate-850/60 pb-2">
                
                <div className="flex items-end justify-center gap-2.5 w-full h-full max-w-[340px]">
                  {leftSnap.array.map((val: number, idx: number) => {
                    const isActive = leftSnap.activeIndices.includes(idx);
                    const isSorted = leftSnap.sortedIndices.includes(idx);
                    
                    const pointersToRender: string[] = [];
                    if (leftSnap.pointers) {
                      for (const [key, pIdx] of Object.entries(leftSnap.pointers)) {
                        if (pIdx === idx) {
                          let label = key;
                          if (key === "pivotIndex") label = "pivot";
                          if (key === "leftBound") label = "L";
                          if (key === "rightBound") label = "R";
                          if (key === "activeMergeL") label = "mL";
                          if (key === "activeMergeR") label = "mR";
                          pointersToRender.push(label);
                        }
                      }
                    }

                    const maxVal = Math.max(...comparisonArray, 100);
                    const heightPercent = Math.max(15, Math.min(100, (val / maxVal) * 100));

                    return (
                      <div key={idx} className="flex flex-col items-center justify-end w-10 h-full relative font-mono">
                        
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-lg flex items-center justify-center text-[10px] font-extrabold transition-all duration-300 shadow-sm relative ${
                            isActive
                              ? "bg-amber-600 border border-amber-400 text-white animate-pulse shadow-md shadow-amber-950/30 scale-105"
                              : isSorted
                              ? "bg-emerald-600 border border-emerald-400 text-white shadow-emerald-950/25"
                              : "bg-indigo-950/25 border border-indigo-900/30 text-indigo-400"
                          }`}
                        >
                          <span className="absolute -top-5 text-[9.5px] font-black text-slate-350">{val}</span>
                        </div>

                        <span className="text-[8.5px] text-slate-500 font-bold block mt-1.5 mb-1 bg-slate-950 px-1 py-0.2 border border-slate-850 rounded">
                          [{idx}]
                        </span>

                        {pointersToRender.length > 0 && (
                          <div className="absolute -bottom-6 w-14 flex flex-col items-center space-y-0.5 justify-center z-10">
                            {pointersToRender.map((ptr, pIdx) => (
                              <span key={pIdx} className="text-[7.5px] font-black uppercase text-indigo-300 bg-indigo-950/70 border border-indigo-900 px-1.2 py-0.2 rounded-md scale-90 leading-tight">
                                {ptr}
                              </span>
                            ))}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

            <div className="mt-8 space-y-4 pt-4 border-t border-slate-800/60 font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/60 px-3.5 py-2 border border-slate-850/60 rounded-xl flex justify-between items-center">
                  <span className="text-[10px] text-slate-450 font-bold uppercase">Comparisons</span>
                  <span className="text-xs text-white font-black">{leftSnap.comparisons}</span>
                </div>
                <div className="bg-slate-950/60 px-3.5 py-2 border border-slate-850/60 rounded-xl flex justify-between items-center">
                  <span className="text-[10px] text-slate-450 font-bold uppercase">
                    {comparisonMode === "search" ? "Remaining Search Space" : "Swaps / Shifts"}
                  </span>
                  <span className="text-xs text-white font-black">
                    {comparisonMode === "search" ? (
                      (() => {
                        if (algoLeft === "binary" && leftSnap.pointers) {
                          const low = leftSnap.pointers.low ?? 0;
                          const high = leftSnap.pointers.high ?? (comparisonArray.length - 1);
                          return Math.max(0, high - low + 1);
                        }
                        return "O(1)";
                      })()
                    ) : (
                      leftSnap.swaps
                    )}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 border border-slate-850/75 rounded-xl h-18 overflow-y-auto select-text custom-scrollbar">
                <span className="text-[9px] text-indigo-400 block font-bold uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5 text-amber-400" /> Simulation Event:
                </span>
                <p className="text-[10.5px] text-slate-300 leading-normal font-sans font-medium">
                  {leftSnap.log || "Awaiting operation step..."}
                </p>
              </div>
            </div>

          </div>

          {/* Panel Beta */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between min-h-[460px] relative overflow-hidden">
            
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-start border-b border-slate-800/50 pb-3">
                <div>
                  <span className="text-[10px] text-indigo-400 font-extrabold uppercase font-mono tracking-wider">Algorithm Beta</span>
                  <h3 className="text-base font-black text-white">{metaRight.name}</h3>
                </div>
                
                <div className="flex flex-wrap gap-1 items-center justify-end">
                  <span className="bg-indigo-950/60 border border-indigo-900/45 text-indigo-300 text-[8.5px] font-black uppercase px-2 py-0.5 rounded-md" title="Average Time Complexity">
                    T(Avg): {metaRight.timeAvg}
                  </span>
                  <span className="bg-slate-950 border border-slate-850 text-slate-400 text-[8.5px] font-black uppercase px-2 py-0.5 rounded-md" title="Worst-case Time Complexity">
                    T(Worst): {metaRight.timeWorst}
                  </span>
                  <span className="bg-slate-950 border border-slate-850 text-slate-400 text-[8.5px] font-black uppercase px-2 py-0.5 rounded-md" title="Auxiliary Space Complexity">
                    S(Space): {metaRight.space}
                  </span>
                </div>
              </div>

              <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed bg-slate-950/30 p-2.5 border border-slate-850/40 rounded-xl italic">
                💡 {metaRight.desc}
              </p>

              <div className="h-44 flex items-end justify-center p-4 py-8 bg-slate-950 rounded-xl relative overflow-hidden border border-slate-850/60 pb-2">
                
                <div className="flex items-end justify-center gap-2.5 w-full h-full max-w-[340px]">
                  {rightSnap.array.map((val: number, idx: number) => {
                    const isActive = rightSnap.activeIndices.includes(idx);
                    const isSorted = rightSnap.sortedIndices.includes(idx);
                    
                    const pointersToRender: string[] = [];
                    if (rightSnap.pointers) {
                      for (const [key, pIdx] of Object.entries(rightSnap.pointers)) {
                        if (pIdx === idx) {
                          let label = key;
                          if (key === "pivotIndex") label = "pivot";
                          if (key === "leftBound") label = "L";
                          if (key === "rightBound") label = "R";
                          if (key === "activeMergeL") label = "mL";
                          if (key === "activeMergeR") label = "mR";
                          pointersToRender.push(label);
                        }
                      }
                    }

                    const maxVal = Math.max(...comparisonArray, 100);
                    const heightPercent = Math.max(15, Math.min(100, (val / maxVal) * 100));

                    return (
                      <div key={idx} className="flex flex-col items-center justify-end w-10 h-full relative font-mono">
                        
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-lg flex items-center justify-center text-[10px] font-extrabold transition-all duration-300 shadow-sm relative ${
                            isActive
                              ? "bg-amber-600 border border-amber-400 text-white animate-pulse shadow-md shadow-amber-950/30 scale-105"
                              : isSorted
                              ? "bg-emerald-600 border border-emerald-400 text-white shadow-emerald-950/25"
                              : "bg-indigo-950/25 border border-indigo-900/30 text-indigo-400"
                          }`}
                        >
                          <span className="absolute -top-5 text-[9.5px] font-black text-slate-350">{val}</span>
                        </div>

                        <span className="text-[8.5px] text-slate-500 font-bold block mt-1.5 mb-1 bg-slate-950 px-1 py-0.2 border border-slate-850 rounded">
                          [{idx}]
                        </span>

                        {pointersToRender.length > 0 && (
                          <div className="absolute -bottom-6 w-14 flex flex-col items-center space-y-0.5 justify-center z-10">
                            {pointersToRender.map((ptr, pIdx) => (
                              <span key={pIdx} className="text-[7.5px] font-black uppercase text-indigo-300 bg-indigo-950/70 border border-indigo-900 px-1.2 py-0.2 rounded-md scale-90 leading-tight">
                                {ptr}
                              </span>
                            ))}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

            <div className="mt-8 space-y-4 pt-4 border-t border-slate-800/60 font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/60 px-3.5 py-2 border border-slate-850/60 rounded-xl flex justify-between items-center">
                  <span className="text-[10px] text-slate-450 font-bold uppercase">Comparisons</span>
                  <span className="text-xs text-white font-black">{rightSnap.comparisons}</span>
                </div>
                <div className="bg-slate-950/60 px-3.5 py-2 border border-slate-850/60 rounded-xl flex justify-between items-center">
                  <span className="text-[10px] text-slate-450 font-bold uppercase">
                    {comparisonMode === "search" ? "Remaining Search Space" : "Swaps / Shifts"}
                  </span>
                  <span className="text-xs text-white font-black">
                    {comparisonMode === "search" ? (
                      (() => {
                        if (algoRight === "binary" && rightSnap.pointers) {
                          const low = rightSnap.pointers.low ?? 0;
                          const high = rightSnap.pointers.high ?? (comparisonArray.length - 1);
                          return Math.max(0, high - low + 1);
                        }
                        return "O(1)";
                      })()
                    ) : (
                      rightSnap.swaps
                    )}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 border border-slate-850/75 rounded-xl h-18 overflow-y-auto select-text custom-scrollbar">
                <span className="text-[9px] text-indigo-400 block font-bold uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5 text-amber-400" /> Simulation Event:
                </span>
                <p className="text-[10.5px] text-slate-300 leading-normal font-sans font-medium">
                  {rightSnap.log || "Awaiting operation step..."}
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Dynamic educational summary metadata */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-3.5 min-h-[160px]">
          <div className="flex items-center space-x-2">
            <Trophy className="h-4.5 w-4.5 text-amber-400" />
            <h4 className="text-sm font-black text-white uppercase tracking-wider font-mono">Performance Recap & Duel Analysis</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans text-slate-400 leading-relaxed">
            <div className="bg-slate-950/50 p-3 border border-slate-850 rounded-xl">
              <span className="font-extrabold text-white block mb-1 text-[11px] uppercase tracking-wide font-mono text-indigo-300">Time Complexity Verdict</span>
              {comparisonMode === "sorting" ? (
                <span>
                  For an array of N={comparisonArray.length} items:
                  <br />- <strong>{metaLeft.name}</strong> worst-case: <strong>{metaLeft.timeWorst}</strong> operations.
                  <br />- <strong>{metaRight.name}</strong> worst-case: <strong>{metaRight.timeWorst}</strong> operations.
                  <br />Divide & conquer (Quick/Merge) divides arrays dynamically, completing simulations substantially faster than quadratic bubble/selection loops.
                </span>
              ) : (
                <span>
                  Searching values inside an array of size N={comparisonArray.length}:
                  <br />- Linear Search scans sequentially, taking worst-case <strong>O(N)</strong>.
                  <br />- Binary Search repeatedly halves the remaining search range, concluding in <strong>O(log N)</strong> checks. This yields massive benefits for larger collections.
                </span>
              )}
            </div>

            <div className="bg-slate-950/50 p-3 border border-slate-850 rounded-xl">
              <span className="font-extrabold text-white block mb-1 text-[11px] uppercase tracking-wide font-mono text-amber-300">Space Trade-off Verdict</span>
              {comparisonMode === "sorting" ? (
                <span>
                  Memory consumption is another critical constraint:
                  <br />- <strong>{metaLeft.name}</strong> operates on a space profile of <strong>{metaLeft.space}</strong>.
                  <br />- <strong>{metaRight.name}</strong> operates on a space profile of <strong>{metaRight.space}</strong>.
                  <br />In many system environments, memory overhead may influence the choice when choosing between Merge Sort (extra space) and Quick Sort (lower space profile).
                </span>
              ) : (
                <span>
                  Both <strong>Linear Search</strong> and <strong>Binary Search</strong> verify elements in-place, taking <strong>O(1)</strong> auxiliary memory.
                  <br />However, Binary Search requires sorted inputs. Sorting itself introduces a minimum of O(N log N) time or minor space overhead depending on the sorting algorithm.
                </span>
              )}
            </div>

            <div className="bg-slate-950/50 p-3 border border-slate-850 rounded-xl">
              <span className="font-extrabold text-white block mb-1 text-[11px] uppercase tracking-wide font-mono text-emerald-300">Key Educational Takeaways</span>
              <span>
                - <strong>Stability</strong>: Algorithms like Merge Sort maintain original elements' order on ties, whereas Quick Sort can swap them.
                <br />- <strong>In-Place execution</strong>: In-place algorithms (e.g. Bubble, Selection, Insertion) directly modify original arrays, avoiding allocation overheads.
              </span>
            </div>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-8 px-4 md:px-8 font-sans animate-fade-in" id="dsa-visualizer-arena">
      <div className="max-w-7xl mx-auto flex flex-col h-full">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-5 mb-8 gap-4">
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => setCurrentPage("dashboard")}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">Algorithms Playground</span>
              <h1 className="text-2xl font-black text-white">DSA Visualization Engine</h1>
            </div>
          </div>

          {/* Sizing dropdown selectors */}
          <div className="flex items-center flex-wrap gap-2.5">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={handleImportFile} 
              id="json-import-file-input"
            />

            {[
              { id: "stack", label: "LIFO Stack 🥞" },
              { id: "queue", label: "FIFO Queue 👥" },
              { id: "array", label: "Dynamic Array 📊" },
              { id: "bst", label: "Binary Search Tree 🌳" },
              { id: "hash_map", label: "Hashing Map (Chaining) 🗃️" },
              { id: "sliding_window", label: "Sliding Window 🪟" },
              { id: "comparison", label: "Comparison Arena ⚖️" }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setStructure(t.id as any)}
                className={`px-3 py-1.5 rounded-xl border font-black uppercase text-[9.5px] tracking-wider transition-all cursor-pointer ${
                  structure === t.id 
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-950/30" 
                    : "bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}

            <div className="h-5 w-px bg-slate-800 mx-1 hidden md:block" id="visualizer-header-sep" />

            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 space-x-1 font-mono text-[9.3px]" id="session-backup-btn-group">
              <button
                onClick={handleExportSession}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg cursor-pointer text-slate-300 hover:text-white hover:bg-slate-800 transition-all font-bold uppercase tracking-wider"
                title="Export custom configurations and current state as JSON"
                id="btn-export-session"
              >
                <Download className="h-3.5 w-3.5 text-indigo-400" />
                <span>Export Config</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg cursor-pointer text-slate-300 hover:text-white hover:bg-slate-800 transition-all font-bold uppercase tracking-wider border-l border-slate-805"
                title="Import progress or custom DSL files to resume"
                id="btn-import-session"
              >
                <Upload className="h-3.5 w-3.5 text-indigo-400" />
                <span>Import Config</span>
              </button>
              <button
                onClick={handleShareSession}
                disabled={isSharing}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg cursor-pointer text-slate-300 hover:text-white hover:bg-slate-800 transition-all font-bold uppercase tracking-wider border-l border-slate-800 disabled:opacity-50"
                title="Generate a public, shareable URL for this DSA session"
                id="btn-share-session"
              >
                {isSharing ? (
                  <Loader2 className="h-3.5 w-3.5 text-pink-400 animate-spin" />
                ) : (
                  <Share2 className="h-3.5 w-3.5 text-pink-400" />
                )}
                <span>Share Progress</span>
              </button>
            </div>
          </div>
        </div>

        {/* Generated Share Link Widget */}
        {generatedShareUrl && (
          <div className="mb-6 p-4 rounded-2xl border bg-indigo-950/20 border-indigo-900/50 text-xs font-mono shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-bounce" id="visualizer-share-url-widget">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1.5 flex items-center space-x-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                <span>Generated Public DSA Share Link:</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-xl border border-slate-900 overflow-x-auto select-all">
                <Link className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="text-slate-200 select-all whitespace-nowrap">{generatedShareUrl}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedShareUrl);
                  setBackupMessage({ text: "Share link copied to clipboard! 📋", isError: false });
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold uppercase tracking-wider cursor-pointer transition-all text-[10px]"
              >
                Copy Link
              </button>
              <button
                onClick={() => setGeneratedShareUrl(null)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl font-bold uppercase tracking-wider border border-slate-850 cursor-pointer transition-all text-[10px]"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Action toast feedback indicator */}
        {backupMessage && (
          <div className={`mb-6 p-3 px-4.5 rounded-2xl border text-xs font-mono font-bold flex items-center justify-between shadow-lg animate-bounce ${
            backupMessage.isError 
              ? "bg-red-950/40 border-red-900/50 text-red-400" 
              : "bg-emerald-990/40 border-emerald-900/50 text-emerald-400"
          }`} id="visualizer-backup-feedback-banner">
            <div className="flex items-center space-x-2">
              <span className="text-sm">{backupMessage.isError ? "⚠️" : "⚡"}</span>
              <span>{backupMessage.text}</span>
            </div>
            <button 
              onClick={() => setBackupMessage(null)} 
              className="text-[10px] uppercase font-bold text-slate-500 hover:text-white transition-all cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dashboard split content */}
        {structure === "comparison" ? renderComparisonLayout() : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls left */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-6">
            
            {/* Quick value inputs */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2 font-mono">
                {structure === "sliding_window" ? "Array Elements (ReadOnly Indicator):" : "Insert Node Elements:"}
              </span>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  maxLength={4}
                  value={structure === "sliding_window" ? "" : newValue}
                  disabled={structure === "sliding_window"}
                  onChange={(e) => setNewValue(e.target.value.replace(/\D/g, ""))}
                  placeholder={structure === "sliding_window" ? "Controlled below" : "e.g. 45"}
                  className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-bold font-mono focus:border-indigo-500 disabled:opacity-50"
                />
                <button
                  onClick={() => {
                    if (structure === "stack") handlePush();
                    else if (structure === "queue") handleEnqueue();
                    else if (structure === "array") handleArrayInsert();
                    else if (structure === "bst") handleBstInsert();
                    else if (structure === "hash_map") handleHashMapInsert();
                  }}
                  disabled={structure === "sliding_window"}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                  <span>Insert</span>
                </button>
              </div>
            </div>

            {/* Structure selective modifiers */}
            <div className="border-t border-slate-800/60 pt-4.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2.5 font-mono">Operations Checklist:</span>
              
              <div className="space-y-3">
                {structure === "stack" && (
                  <button
                    onClick={handlePop}
                    disabled={nodes.length === 0}
                    className="w-full bg-red-950/40 hover:bg-red-950/60 border border-red-900/30 text-red-400 font-bold px-3 py-2 text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Pop (LIFO Delete)</span>
                  </button>
                )}

                {structure === "queue" && (
                  <button
                    onClick={handleDequeue}
                    disabled={nodes.length === 0}
                    className="w-full bg-red-950/40 hover:bg-red-950/60 border border-red-900/30 text-red-400 font-bold px-3 py-2 text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Dequeue (FIFO Delete)</span>
                  </button>
                )}

                {structure === "bst" && (
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleTraverse("pre")}
                      className="bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 font-semibold py-2 px-1 text-[10px] rounded-lg transition-all"
                    >
                      Preorder 🌳
                    </button>
                    <button
                      onClick={() => handleTraverse("in")}
                      className="bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 font-semibold py-2 px-1 text-[10px] rounded-lg transition-all"
                    >
                      Inorder 🌳
                    </button>
                    <button
                      onClick={() => handleTraverse("post")}
                      className="bg-slate-950 hover:bg-slate-850 text-slate-330 border border-slate-800 font-semibold py-2 px-1 text-[10px] rounded-lg transition-all"
                    >
                      Postorder 🌳
                    </button>
                  </div>
                )}

                {structure === "hash_map" && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setHashBuckets([
                          [12, 22, 32],
                          [7, 17],
                          [3],
                          [19, 29],
                          [5, 10, 15]
                        ]);
                        setTraversalLog(["Loaded heavy collision seed preset metrics. Study clustering chaining!"]);
                      }}
                      className="bg-indigo-950/40 hover:bg-indigo-950/80 text-indigo-300 border border-indigo-900/40 font-bold py-2 px-2.5 text-[10px] rounded-xl transition-all cursor-pointer"
                    >
                      Seed Demo Chains 🧬
                    </button>
                    <button
                      onClick={() => {
                        setHashBuckets([[], [], [], [], []]);
                        setTraversalLog(["Cleared Hash Map chains completely."]);
                      }}
                      className="bg-slate-950 hover:bg-slate-850 text-slate-400 border border-slate-850 font-bold py-2 px-2.5 text-[10px] rounded-xl transition-all cursor-pointer"
                    >
                      Clear Chains ✕
                    </button>
                  </div>
                )}

                {structure === "sliding_window" && (
                  <div className="space-y-3 font-mono">
                    {/* Window selector */}
                    <div>
                      <span className="text-[9px] text-slate-500 block mb-1">Set Window Size K:</span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[2, 3, 4, 5].map((k) => (
                          <button
                            key={k}
                            onClick={() => handleSlideSizeChange(k)}
                            className={`py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                              windowSize === k 
                                ? "bg-indigo-600 text-white border-transparent" 
                                : "bg-slate-950 border border-slate-850 text-slate-400 hover:text-white"
                            }`}
                          >
                            K={k}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={handleSlideStep}
                        className="bg-indigo-950/60 hover:bg-indigo-950 text-indigo-400 border border-indigo-900/40 font-bold py-2 px-2 text-[10px] rounded-xl transition-all cursor-pointer text-center"
                      >
                        Slide Step ➔
                      </button>
                      <button
                        onClick={handleSlideAutoPlay}
                        disabled={isPlaying}
                        className="bg-emerald-950/60 hover:bg-emerald-950 text-emerald-400 border border-emerald-900/40 font-bold py-2 px-2 text-[10px] rounded-xl transition-all cursor-pointer text-center disabled:opacity-40 animate-pulse"
                      >
                        Slide Loop 🌟
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Nodes lookup tools */}
            <div className="border-t border-slate-800/60 pt-4.5">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2 font-mono">Search Element path:</span>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 20"
                  className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-bold font-mono focus:border-indigo-500"
                />
                <button
                  onClick={handleSearch}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Sizing scale and resetters */}
            <div className="border-t border-slate-800/60 pt-4.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 block uppercase font-mono">Step Delay:</span>
                <input
                  type="range"
                  min={400}
                  max={2000}
                  step={200}
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  className="w-24 accentuate-indigo hover:opacity-100 opacity-80"
                />
              </div>

              <button
                onClick={resetStructure}
                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-850 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Canvas
              </button>
            </div>
          </div>

          {/* Simulated Visualization Stage Right */}
          <div className="lg:col-span-8 grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch animate-fadeIn">
            
            {/* Visual Stage Column */}
            <div className="xl:col-span-7 bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between min-h-[460px]">
              
              {/* Display header state indicators */}
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-6 font-mono">
              <div className="flex items-center space-x-2">
                <Tv className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  {structure === "hash_map" ? "Hash collisionSeparate Chaining" : structure === "sliding_window" ? "MAX SUBARRAY Sliding Window" : `${structure} Structural`} Arena
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`inline-block h-2 w-2 rounded-full ${isPlaying ? "bg-emerald-500 animate-pulse" : "bg-slate-600"}`} />
                <span className="text-[10px] font-black text-slate-400 uppercase">
                  {isPlaying ? "ACTIVE PLAY" : "IDLE / STEP"}
                </span>
              </div>
            </div>

            {/* Dynamic Stage Canvas rendering */}
            <div className="flex-1 flex items-center justify-center p-5 bg-slate-950 rounded-xl relative overflow-hidden min-h-[340px]">
              {(structure !== "hash_map" && structure !== "sliding_window" && nodes.length === 0) ? (
                <div className="text-slate-600 text-center flex flex-col items-center justify-center gap-2 font-mono text-xs italic">
                  <span>Structural list empty. Please insert elements.</span>
                </div>
              ) : (
                <>
                  {/* ARRAY RENDER */}
                  {structure === "array" && (
                    <div className="flex items-center flex-wrap gap-2.5">
                      {nodes.map((node, nI) => {
                        const idxHigh = activeNodeId === node.id;
                        return (
                          <div
                            key={node.id}
                            className={`flex flex-col items-center border rounded-xl p-3 select-none transition-all duration-300 min-w-[50px] relative ${
                              idxHigh ? "bg-indigo-950 border-indigo-400 shadow-lg scale-110" : "bg-slate-905 border-slate-850"
                            }`}
                          >
                            <span className="text-[9px] text-slate-500 font-mono mb-1">[{nI}]</span>
                            <span className="text-xs font-black font-mono text-white">{node.val}</span>

                            <button
                              onClick={() => handleArrayDeleteAt(node.id)}
                              className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-slate-800 border border-slate-700 hover:bg-red-950/80 hover:text-red-400 text-slate-500 flex items-center justify-center text-[8px] cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* STACK RENDER (Bottom-up vertical stack) */}
                  {structure === "stack" && (
                    <div className="flex flex-col-reverse items-center border-l border-r border-b border-indigo-900 px-4 pb-2 pt-1 w-36 rounded-b-xl space-y-2 space-y-reverse">
                      {nodes.map((node, nI) => {
                        const isActive = activeNodeId === node.id;
                        return (
                          <div
                            key={node.id}
                            className={`w-full py-2 px-3 text-center rounded-lg border font-mono text-xs font-extrabold select-none transition-all duration-300 ${
                              isActive ? "bg-indigo-950 border-indigo-400 text-indigo-300 scale-105" : "bg-slate-900 border-slate-800 text-slate-200"
                            }`}
                          >
                            {node.val} {nI === nodes.length - 1 && <span className="text-[9px] text-indigo-400 pl-1">TOP</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* QUEUE RENDER (Horizontal dequeue -> enqueue line) */}
                  {structure === "queue" && (
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[9.5px] uppercase font-bold text-slate-600 block mr-2 font-mono">Exit ➔</span>
                      {nodes.map((node, nI) => {
                        const isActive = activeNodeId === node.id;
                        return (
                          <div
                            key={node.id}
                            className={`py-3.5 px-4 text-center rounded-xl border font-mono text-xs font-black select-none transition-all duration-300 ${
                              isActive ? "bg-indigo-950 border-indigo-400 text-indigo-300 scale-105" : "bg-slate-900 border-slate-800 text-slate-100"
                            }`}
                          >
                            {node.val}
                            <span className="block text-[8px] text-slate-500 font-normal m-0 p-0">
                              {nI === 0 ? "FRONT" : nI === nodes.length - 1 ? "REAR" : "IDX " + nI}
                            </span>
                          </div>
                        );
                      })}
                      <span className="text-[9.5px] uppercase font-bold text-slate-600 block ml-2 font-mono">&#8678; Enter</span>
                    </div>
                  )}

                  {/* BST RENDER (Interactive custom SVG circles with links) */}
                  {structure === "bst" && (
                    <svg className="w-full max-w-[320px] h-[180px]" id="visualizer-svg">
                      {/* Lines linking elements */}
                      {nodes.map((node) => {
                        const pX = node.x || 150;
                        const pY = node.y || 30;
                        return (
                          <g key={`lines-${node.id}`}>
                            {node.left && (
                              (() => {
                                const leftChild = nodes.find(n => n.id === node.left);
                                if (leftChild) {
                                  return (
                                    <line
                                      x1={pX}
                                      y1={pY}
                                      x2={leftChild.x || 80}
                                      y2={leftChild.y || 90}
                                      stroke="#1e293b"
                                      strokeWidth="2"
                                    />
                                  );
                                }
                                return null;
                              })()
                            )}

                            {node.right && (
                              (() => {
                                const rightChild = nodes.find(n => n.id === node.right);
                                if (rightChild) {
                                  return (
                                    <line
                                      x1={pX}
                                      y1={pY}
                                      x2={rightChild.x || 220}
                                      y2={rightChild.y || 90}
                                      stroke="#1e293b"
                                      strokeWidth="2"
                                    />
                                  );
                                }
                                return null;
                              })()
                            )}
                          </g>
                        );
                      })}

                      {/* Circles rendering on top of paths */}
                      {nodes.map((node) => {
                        const pX = node.x || 150;
                        const pY = node.y || 30;
                        const isActive = activeNodeId === node.id;
                        return (
                          <g key={`circles-${node.id}`}>
                            <circle
                              cx={pX}
                              cy={pY}
                              r="15"
                              fill={isActive ? "#1e1b4b" : "#0f172a"}
                              stroke={isActive ? "#818cf8" : "#334155"}
                              strokeWidth={isActive ? "2" : "1.5"}
                              className="transition-all duration-300"
                            />
                            <text
                              x={pX}
                              y={pY + 4}
                              textAnchor="middle"
                              fill={isActive ? "#a5b4fc" : "#cbd5e1"}
                              fontSize="10px"
                              fontWeight="bold"
                              fontFamily="monospace"
                              className="select-none"
                            >
                              {node.val}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  )}

                  {/* HASH MAP RENDER (Separate chaining interactive visualizer) */}
                  {structure === "hash_map" && (
                    <div className="w-full space-y-3 py-1 font-mono">
                      <div className="text-center mb-1 bg-slate-900/40 py-1.5 rounded-lg border border-slate-850/60 max-w-xs mx-auto">
                        <span className="text-[10.5px] text-indigo-400 font-extrabold uppercase">
                          Hash Formula: Key % 5 Buckets
                        </span>
                      </div>
                      
                      {hashBuckets.map((bucket, bIdx) => {
                        const isBucketActive = activeBucketIdx === bIdx;
                        return (
                          <div key={bIdx} className="flex items-center space-x-3 bg-slate-900/50 p-2 rounded-xl border border-slate-850/60 leading-none">
                            {/* Bucket key tag */}
                            <div className={`w-24 text-center py-2 px-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                              isBucketActive 
                                ? "bg-indigo-650 text-white shadow-md shadow-indigo-950 animate-pulse border border-indigo-500" 
                                : "bg-slate-950 text-slate-450 border border-slate-850"
                            }`}>
                              Bucket [{bIdx}]
                            </div>

                            <span className="text-slate-600 text-xs font-bold leading-none select-none">➔</span>

                            {/* Node list chains */}
                            <div className="flex items-center flex-wrap gap-2 flex-1 min-h-[32px]">
                              {bucket.length === 0 ? (
                                <span className="text-[9.5px] text-slate-650 italic font-medium px-1 select-none">null (empty)</span>
                              ) : (
                                bucket.map((val, vIdx) => {
                                  const isCheckingItem = isBucketActive && activeChainItemIdx === vIdx;
                                  return (
                                    <div key={vIdx} className="flex items-center space-x-1.5 animate-fadeIn">
                                      <div className={`py-1.5 px-3 rounded-lg border text-xs font-black relative transition-all duration-300 pr-7 ${
                                        isCheckingItem 
                                          ? "bg-indigo-950 border-indigo-400 text-indigo-300 scale-105 shadow-md animate-pulse" 
                                          : "bg-slate-950 border-slate-850 text-slate-100"
                                      }`}>
                                        <span>{val}</span>
                                        <button
                                          onClick={() => handleHashMapDelete(bIdx, vIdx)}
                                          className="absolute top-1/2 -translate-y-1/2 right-1.5 h-3.5 w-3.5 rounded-full bg-slate-905 border border-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-500 flex items-center justify-center text-[7px] cursor-pointer"
                                          title="Delete element"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                      {vIdx < bucket.length - 1 && (
                                        <span className="text-indigo-600/50 text-xs font-bold font-sans">➔</span>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* SLIDING WINDOW TRACKER */}
                  {structure === "sliding_window" && (
                    <div className="w-full py-2 space-y-6">
                      
                      {/* Array elements segment row */}
                      <div className="relative pt-6 flex justify-center items-center flex-wrap gap-2 md:gap-3 rounded-xl min-h-[90px]">
                        {slidingArray.map((val, idx) => {
                          const isInWindow = idx >= leftPtr && idx <= rightPtr;
                          const isLeft = idx === leftPtr;
                          const isRight = idx === rightPtr;

                          return (
                            <div key={idx} className="relative flex flex-col items-center">
                              {/* Left & Right marker pointers */}
                              {(isLeft || isRight) && (
                                <span className={`absolute -top-6 text-[9.5px] font-black py-0.5 px-1.5 rounded shadow-md select-none tracking-widest ${
                                  isLeft && isRight 
                                    ? "bg-purple-600 text-white animate-bounce" 
                                    : isLeft 
                                      ? "bg-indigo-600 text-white animate-bounce" 
                                      : "bg-emerald-600 text-white animate-bounce"
                                }`}>
                                  {isLeft && isRight ? "L+R" : isLeft ? "L" : "R"}
                                </span>
                              )}

                              {/* Array cell card */}
                              <div className={`w-11 h-14 rounded-xl border flex flex-col items-center justify-center select-none font-mono transition-all duration-300 ${
                                isInWindow 
                                  ? "bg-indigo-950 border-indigo-400 scale-103 shadow-md shadow-indigo-950/40 text-indigo-200 ring-2 ring-indigo-550/30" 
                                  : "bg-slate-905 border-slate-850 text-slate-450"
                              }`}>
                                <span className="text-[8px] text-slate-550 font-medium mb-0.5">[{idx}]</span>
                                <span className="text-xs font-black">{val}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Display window telemetry metadata grids stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 bg-slate-900/40 p-4 rounded-xl border border-slate-850/80 font-mono">
                        <div className="text-center p-2 rounded-xl bg-slate-950/70 border border-slate-850">
                          <span className="text-[8.5px] text-slate-500 uppercase tracking-widest font-bold block mb-1">Window Span (K)</span>
                          <span className="text-xs font-black text-white">{windowSize} Frames</span>
                        </div>

                        <div className="text-center p-2 rounded-xl bg-slate-950/70 border border-slate-850">
                          <span className="text-[8.5px] text-slate-500 uppercase tracking-widest font-bold block mb-1">Pointers Index</span>
                          <span className="text-xs font-black text-indigo-400">Index [{leftPtr}...{rightPtr}]</span>
                        </div>

                        <div className="text-center p-2 rounded-xl bg-slate-950/70 border border-slate-850">
                          <span className="text-[8.5px] text-slate-500 uppercase tracking-widest font-bold block mb-1">Current Sum</span>
                          <span className="text-xs font-black text-emerald-400">{currentWindowSum}</span>
                        </div>

                        <div className="text-center p-2 rounded-xl bg-slate-950/70 border border-indigo-900/30">
                          <span className="text-[8.5px] text-slate-500 uppercase tracking-widest font-bold block mb-1">Maximum Sum (🌟)</span>
                          <span className="text-xs font-black text-amber-300 animate-pulse">{maxWindowSum}</span>
                        </div>
                      </div>

                    </div>
                  )}
                </>
              )}
            </div>

            {/* Step-Back and History Navigation toolbar */}
            <div className="mt-4 pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold flex items-center gap-1">
                  <RotateCcw className="h-3 w-3 text-slate-550" />
                  Algorithm History trace:
                </span>
                <span className="text-[10px] text-indigo-400 font-extrabold bg-indigo-950/55 border border-indigo-900/30 px-2 py-0.5 rounded-lg">
                  {historyStack.length} Steps
                </span>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={handleStepBack}
                  disabled={historyStack.length === 0}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3.5 py-1.5 bg-slate-950 hover:bg-slate-850 disabled:bg-slate-950 disabled:opacity-40 border border-slate-850 rounded-xl text-[10px] font-extrabold uppercase text-slate-300 hover:text-white transition-all cursor-pointer active:scale-97"
                >
                  <ArrowLeft className="h-3 w-3 text-indigo-400" />
                  <span>Step-Back</span>
                </button>
                <button
                  onClick={() => {
                    setHistoryStack([]);
                    setTraversalLog(prev => [...prev, "History log stack flushed."]);
                  }}
                  disabled={historyStack.length === 0}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-1 px-3 py-1.5 bg-slate-950 hover:bg-slate-850 disabled:opacity-40 border border-slate-850 rounded-xl text-[9px] font-bold uppercase text-slate-500 hover:text-red-400 hover:border-red-950/40 transition-all cursor-pointer"
                >
                  Clear History
                </button>
              </div>
            </div>

            {/* Stepper active logs info */}
            <div className="mt-5 border-t border-slate-800/60 pt-4.5 bg-slate-950/30 p-3 rounded-lg border border-slate-850/60">
              <span className="text-[10px] text-slate-500 font-mono block uppercase mb-1">Visualizer trace trail:</span>
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono leading-relaxed text-slate-400">
                {traversalLog.length === 0 ? (
                  <span className="italic select-none text-slate-650">Empty trace. Select algorithms to observe visual pathways.</span>
                ) : (
                  traversalLog.map((log, index) => (
                    <span key={index} className="bg-slate-900 border border-slate-850 px-2.2 py-0.5 rounded leading-normal">
                      {log}
                    </span>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Interactive Code Companion & Complexity columns */}
          <div className="xl:col-span-5 flex flex-col space-y-5">
            
            {/* Mode selection tabs */}
            <div className="flex bg-slate-900 border border-slate-800/85 p-1 rounded-2xl shadow-md items-center justify-between space-x-1 border border-slate-850 font-mono">
              <button
                onClick={() => setRightPaneTab("study")}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase transition-all tracking-wider text-center cursor-pointer flex items-center justify-center space-x-2 ${
                  rightPaneTab === "study"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/30"
                    : "text-slate-400 hover:text-indigo-400 hover:bg-slate-950/40"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Study Room</span>
              </button>
              <button
                onClick={() => {
                  setRightPaneTab("quiz");
                  if (quizCompleted) {
                    setCurrentQuizIndex(0);
                    setSelectedOption(null);
                    setQuizSubmitted(false);
                    setQuizScore(0);
                    setQuizAnswers({});
                    setQuizCompleted(false);
                  }
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase transition-all tracking-wider text-center cursor-pointer flex items-center justify-center space-x-2 ${
                  rightPaneTab === "quiz"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/30"
                    : "text-slate-400 hover:text-indigo-400 hover:bg-slate-950/40"
                }`}
              >
                <Award className="h-3.5 w-3.5" />
                <span>Quiz Arena</span>
              </button>
            </div>

            {rightPaneTab === "study" ? (
              <>
                {/* Interactive Code Companion card */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between min-h-[380px]">
                  <div className="flex flex-col h-full space-y-4">
                    
                    {/* Header title */}
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 font-mono">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-amber-400" />
                        <span className="text-xs font-black text-white uppercase tracking-wider">
                          Interactive Code Companion
                        </span>
                      </div>
                    </div>

                    {/* Info guide card */}
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans bg-slate-950/40 p-2.5 border border-slate-850 rounded-xl">
                      💡 <span className="font-extrabold text-indigo-300">Live Workspace</span>: Dynamic variables inside the code templates update instantly when you execute canvas operations. Select from multiple coding languages below:
                    </p>

                    {/* Lang state tabs */}
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 items-center justify-between space-x-1.5 font-mono font-sans">
                      {[
                        { id: "javascript", label: "JS" },
                        { id: "python", label: "Python" },
                        { id: "java", label: "Java" },
                        { id: "cpp", label: "C++" }
                      ].map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => setCodeLanguage(lang.id as any)}
                          className={`flex-1 py-1 px-1.5 rounded-lg text-[9.5px] font-extrabold uppercase transition-all tracking-wider text-center cursor-pointer ${
                            codeLanguage === lang.id 
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-950/30" 
                              : "text-slate-550 hover:text-indigo-400 hover:bg-slate-900/40"
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>

                    {/* Preformatted editor container */}
                    <div className="flex-1 bg-slate-950 p-4 border border-slate-850 rounded-xl overflow-y-auto select-text custom-scrollbar max-h-[160px] xl:max-h-[180px]">
                      <pre ref={codePreRef} className="whitespace-pre text-slate-300 font-mono text-[10.5px] leading-relaxed">
                        {renderInteractiveCode()}
                      </pre>
                    </div>

                    {/* Ask AI Control Bar */}
                    <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-wide font-mono flex items-center gap-1">
                          <Brain className="h-3 w-3 text-indigo-400" />
                          Tutor Companion
                        </span>
                        <span className="text-[9px] text-slate-400">
                          Highlight any code line(s) to isolate, or click explain standard.
                        </span>
                      </div>
                      
                      <button
                        onClick={handleExplainHighlightedCode}
                        disabled={isAnalyzingCode}
                        className="flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-550 hover:to-violet-550 disabled:from-slate-850 disabled:to-slate-850 disabled:text-slate-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg cursor-pointer transition-all shadow-md shadow-indigo-950/35 active:scale-[0.97] shrink-0"
                      >
                        {isAnalyzingCode ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin text-indigo-200" />
                            <span>Analyzing...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3 text-amber-300" />
                            <span>Ask AI</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* AI Code Explanation Panel */}
                    {(isAnalyzingCode || codeAnalysisResult || codeAnalysisError) && (
                      <div className="bg-slate-950 border border-indigo-500/25 rounded-xl p-3.5 relative overflow-hidden transition-all duration-300 shadow-xl max-h-[220px] flex flex-col justify-between">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-indigo-950/60 pb-2 mb-2.5">
                          <div className="flex items-center space-x-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                            <span className="text-[10px] font-black uppercase text-indigo-300 font-mono tracking-wider">
                              AI Explanation
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setCodeAnalysisResult(null);
                              setCodeAnalysisError(null);
                              setSelectedSnippet(null);
                            }}
                            className="p-1 hover:bg-slate-900 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Content Scroll area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 select-text text-left">
                          {isAnalyzingCode ? (
                            <div className="flex flex-col items-center justify-center py-6 space-y-2">
                              <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
                              <p className="text-[9.5px] font-bold text-slate-400 animate-pulse font-mono uppercase tracking-widest">Generating Tutor Insights...</p>
                            </div>
                          ) : codeAnalysisError ? (
                            <p className="text-[10px] text-red-400 italic bg-red-950/20 border border-red-900/30 p-2.5 rounded-lg font-mono">
                              ⚠️ {codeAnalysisError}
                            </p>
                          ) : (
                            <div className="space-y-1.5 font-sans">
                              {renderExplanationText(codeAnalysisResult || "")}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Complexity Analysis Panel Card */}
                {renderComplexityPanel()}
              </>
            ) : renderQuizPanel()}

          </div>

        </div>
      </div>
    )}

        {/* Floating Mobile Sidebar Trigger button */}
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsMobileSidebarOpen(prev => !prev)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3.5 rounded-full shadow-2xl flex items-center justify-center border border-indigo-505/35 cursor-pointer transform hover:scale-105 active:scale-95 transition-all text-xs font-extrabold"
            id="mobile-drawer-trigger-btn"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            <span className="font-mono uppercase tracking-wider text-[10px]">DS Sections</span>
          </button>
        </div>

        {/* Mobile Sidebar Drawer Overlay */}
        {isMobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/65 backdrop-blur-xs z-50 transition-opacity duration-300 flex justify-end" id="mobile-drawer-overlay">
            {/* Click outside backdrop close layer */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsMobileSidebarOpen(false)} />
            
            {/* Nav container drawer content block */}
            <div className="relative h-full w-[290px] bg-slate-900 border-l border-slate-805 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto z-10 text-left">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Tv className="h-4 w-4 text-indigo-400" />
                    <span className="text-[11px] font-black uppercase text-white font-mono tracking-wider">DS Structures</span>
                  </div>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2 mt-5">
                  {[
                    { id: "stack", label: "LIFO Stack 🥞", desc: "Push & Pop simulation" },
                    { id: "queue", label: "FIFO Queue 👥", desc: "Enqueue & Dequeue rules" },
                    { id: "array", label: "Dynamic Array 📊", desc: "Index insertion & deletion" },
                    { id: "bst", label: "Binary Search Tree 🌳", desc: "BST search & ordering" },
                    { id: "hash_map", label: "Hashing Map 🗃️", desc: "Separate chaining logic" },
                    { id: "sliding_window", label: "Sliding Window 🪟", desc: "Max subarray Peak trace" },
                    { id: "comparison", label: "Comparison Arena ⚖️", desc: "Sort & search dual run" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setStructure(t.id as any);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border flex flex-col transition-all cursor-pointer ${
                        structure === t.id
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg"
                          : "bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-400"
                      }`}
                    >
                      <span className="text-xs font-black uppercase font-mono">{t.label}</span>
                      <span className="text-[9px] text-slate-450 mt-0.5">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-800">
                <p className="text-[9px] text-slate-500 font-mono text-center">InterviewAce AI Playground © 2026</p>
              </div>
            </div>
          </div>
        )}

        </div>

      </div>
  );
};

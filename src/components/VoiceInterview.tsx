/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Sparkles, 
  CheckCircle, 
  TrendingUp, 
  MessageSquare, 
  Volume2, 
  Trophy, 
  RefreshCw,
  Send,
  UserCheck
} from "lucide-react";

interface VoiceInterviewProps {
  setCurrentPage: (page: string) => void;
}

interface QuestionChoice {
  text: string;
  category: string;
}

const SAMPLE_QUESTIONS: Record<string, QuestionChoice[]> = {
  HR: [
    { text: "Why do you want to join our organization, and what makes you a unique placement fit?", category: "Cultural Fit" },
    { text: "Tell me about a time you handled a difficult conflict inside a technical engineering team.", category: "Behavioral" },
    { text: "Where do you envision your engineering career in five years, and how does this role line up?", category: "Career Path" }
  ],
  Technical: [
    { text: "Can you explain how a Hash Map handles collision resolution, and compare chaining to open addressing algorithms?", category: "Data Structures" },
    { text: "How does binary search achieve O(log N) time representation, and what is its search space application?", category: "Search Algorithms" },
    { text: "Explain the difference between QuickSort and MergeSort, focusing on their space bounds in modern VM systems.", category: "Sorting" }
  ],
  SystemDesign: [
    { text: "How would you design a design-first distributed rate limiter for a production-scale API gateway?", category: "High Level Design" },
    { text: "Explain how you would handle persistent state synchronization between multiple client-side caches and a Spanner Database.", category: "Data Sync" },
    { text: "How would you design a cost-efficient trace file analysis collector serving up to 1 million daily requests?", category: "Scale" }
  ]
};

export const VoiceInterview: React.FC<VoiceInterviewProps> = ({ setCurrentPage }) => {
  const [sessionMode, setSessionMode] = useState<"HR" | "Technical" | "SystemDesign">("Technical");
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [candidateTranscript, setCandidateTranscript] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Spoken voice configurations & speed adjustments
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [voicePitch, setVoicePitch] = useState<number>(1.0);

  // Custom AI job position generator
  const [customRole, setCustomRole] = useState<string>("");
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);
  const [customQuestions, setCustomQuestions] = useState<QuestionChoice[] | null>(null);

  // Live microphone errors
  const [micError, setMicError] = useState<string | null>(null);

  // Ratings result boards
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [reportHistory, setReportHistory] = useState<any[]>([]);

  const speechWaves = Array.from({ length: 15 }, (_, i) => i);

  // Clean dynamic question list selector
  const getActiveQuestionList = (): QuestionChoice[] => {
    if (customQuestions && customQuestions.length > 0) {
      return customQuestions;
    }
    return SAMPLE_QUESTIONS[sessionMode];
  };

  const startSession = () => {
    setIsSessionActive(true);
    setCurrentQuestionIdx(0);
    setCandidateTranscript("");
    setIsRecording(false);
    setEvaluation(null);
    setMicError(null);
    const activeQuestions = getActiveQuestionList();
    speakQuestion(activeQuestions[0].text);
  };

  const speakQuestion = (qText: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(qText);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.pitch = voicePitch;
      utterance.rate = voiceSpeed;
      window.speechSynthesis.speak(utterance);
    } else {
      // Simulate speaking
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 2500);
    }
  };

  // Web Speech Native Webkit/Speech Recognition Ref
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event: any) => {
        let currentText = "";
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + " ";
        }
        setCandidateTranscript(currentText.trim());
      };

      rec.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === "not-allowed") {
          setMicError("Microphone permission was denied. Please allow microphone access in your browser bar.");
        } else if (event.error === "no-speech") {
          // Keep recording but notify user
          console.log("No speech detected this turn");
        } else {
          setMicError(`Transcription error: ${event.error}`);
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleMicToggle = () => {
    setMicError(null);
    if (!isRecording) {
      setCandidateTranscript("");
      if (recognitionRef.current) {
        try {
          setIsRecording(true);
          recognitionRef.current.start();
        } catch (e) {
          console.error("Failed to start speech recognition", e);
          setIsRecording(false);
        }
      } else {
        // Fallback for mock environment compatibility/mobile
        setIsRecording(true);
        setMicError("Dual Web Speech Recognition is loading or unsupported in this window. Simulated mock transcript loaded.");
        setTimeout(() => {
          setCandidateTranscript("My answer is that we can solve this problem using a hash map logic where keys are complement metrics, and indexing provides O(1) checks. This is highly efficient and minimizes memory overhead.");
          setIsRecording(false);
        }, 1500);
      }
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Failed to stop recognition", e);
        }
      }
      setIsRecording(false);
    }
  };

  // Generate customized questions from AI based on input role
  const handleGenerateCustomQuestions = async () => {
    if (!customRole.trim()) return;
    try {
      setIsGeneratingQuestions(true);
      setMicError(null);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/interviews/voice/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          role: customRole,
          mode: sessionMode
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setCustomQuestions(data.questions);
          // Launch session right away with the custom tailored Gemini question deck
          setIsSessionActive(true);
          setCurrentQuestionIdx(0);
          setCandidateTranscript("");
          setIsRecording(false);
          setEvaluation(null);
          speakQuestion(data.questions[0].text);
        } else {
          setMicError("AI failed to return structured questions. Please try a different position description.");
        }
      } else {
        setMicError("Could not connect to Gemini custom question generator.");
      }
    } catch (err) {
      console.error(err);
      setMicError("An unexpected server error occurred generating tailored questions.");
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Interactive follow up turn: Insert Gemini's active follow-up into the dynamic stack
  const handleAnswerFollowUp = () => {
    if (!evaluation || !evaluation.followUpQuestion) return;
    const followUpText = evaluation.followUpQuestion;
    
    const newQuestionObj = {
      text: followUpText,
      category: "AI Convergent Mock"
    };

    const currentList = getActiveQuestionList();
    const updated = [...currentList];
    // Insert follow-up directly after current index
    updated.splice(currentQuestionIdx + 1, 0, newQuestionObj);
    setCustomQuestions(updated);
    
    // Jump to the newly added dynamic sub-question immediately
    setTimeout(() => {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setCandidateTranscript("");
      setEvaluation(null);
      setIsRecording(false);
      speakQuestion(followUpText);
    }, 120);
  };

  const submitVerbalAnswer = async () => {
    if (!candidateTranscript.trim()) return;
    try {
      setIsSyncing(true);
      const activeQuestions = getActiveQuestionList();
      const activeQ = activeQuestions[currentQuestionIdx].text;
      
      const token = localStorage.getItem("token");
      const res = await fetch("/api/interviews/voice/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          question: activeQ,
          answer: candidateTranscript,
          mode: sessionMode
        })
      });

      if (res.ok) {
        const data = await res.json();
        setEvaluation(data);
        
        // Push in local history
        const newRecord = {
          date: new Date().toLocaleDateString(),
          mode: sessionMode,
          question: activeQ,
          score: data.overallRating
        };
        setReportHistory(prev => [newRecord, ...prev]);

        // Post back to create persistent session checkpoint in database.json
        await fetch("/api/interviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            role: `${sessionMode} Mock Voice`,
            difficulty: "Medium",
            score: data.overallRating
          })
        });

      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const nextQuestion = () => {
    const nextIdx = currentQuestionIdx + 1;
    const activeQuestions = getActiveQuestionList();
    if (nextIdx < activeQuestions.length) {
      setCurrentQuestionIdx(nextIdx);
      setCandidateTranscript("");
      setEvaluation(null);
      setIsRecording(false);
      speakQuestion(activeQuestions[nextIdx].text);
    } else {
      // Finalized
      setIsSessionActive(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-8 px-4 md:px-8 font-sans" id="voice-mock-view">
      <div className="max-w-5xl mx-auto flex flex-col h-full">

        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-900 pb-5 mb-8">
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => setCurrentPage("dashboard")}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">Vocal Audits</span>
              <h1 className="text-2xl font-black text-white">AI Voice Mock Interview</h1>
            </div>
          </div>

          <span className="text-[10.5px] font-mono text-slate-500 bg-slate-900 border border-slate-855 px-3 py-1 rounded-xl uppercase">TTS speech module configured</span>
        </div>

        {/* Double structural panels split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Stage left */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-805/80 rounded-2xl p-6 shadow-xl space-y-6">
            {!isSessionActive ? (
              <div className="py-6 text-center space-y-6">
                <div className="h-14 w-14 rounded-2xl bg-indigo-950 flex items-center justify-center mx-auto border border-indigo-900/30">
                  <Mic className="h-6 w-6 text-indigo-400 animate-pulse" />
                </div>

                <div className="max-w-md mx-auto space-y-2">
                  <h2 className="text-lg font-black text-white">Choose your session track:</h2>
                  <p className="text-xs text-slate-450 leading-relaxed">
                    AI Speech filters convert verbal transcripts to structured text. Choose between behavioral tracks, technical concepts, or build a custom AI mock interview.
                  </p>
                </div>

                {/* Grid tracks selectors */}
                <div className="grid grid-cols-3 gap-3 mr-auto max-w-sm mx-auto">
                  {["HR", "Technical", "SystemDesign"].map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setSessionMode(m as any);
                        setCustomQuestions(null); // Reset custom list if preset is chosen
                      }}
                      className={`py-3 rounded-xl border text-[10px] font-extrabold uppercase tracking-wide transition-all cursor-pointer ${
                        sessionMode === m && !customQuestions
                          ? "bg-indigo-600 text-white border-indigo-550 shadow-md shadow-indigo-955/20" 
                          : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {m === "SystemDesign" ? "System Design" : m}
                    </button>
                  ))}
                </div>

                {/* ADVANCED CUSTOM AI POSITION TAILORED GENERATOR */}
                <div className="max-w-lg mx-auto bg-slate-950 p-5 rounded-2xl border border-slate-850 text-left space-y-3.5">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    <span className="text-[10.5px] uppercase font-bold tracking-wider text-white">Dream Company & Job Role Generator (Dynamic AI)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Enter any company and target position (e.g., <span className="text-indigo-300 italic">"Google Frontend Developer"</span>, <span className="text-indigo-300 italic">"Fintech Specialist at Stripe"</span>). Gemini will generate 3 highly targeted scenario questions.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      placeholder="e.g. Amazon Web Services engineer with 3 YOE..."
                      className="flex-1 bg-slate-900 border border-slate-800 text-xs px-3.5 py-2.5 rounded-xl text-slate-100 outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleGenerateCustomQuestions}
                      disabled={isGeneratingQuestions || !customRole.trim()}
                      className="bg-indigo-600/90 hover:bg-indigo-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-[10.5px] shrink-0 uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      {isGeneratingQuestions ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                          Launch AI Deck
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* SPEAKING VOICE CONTROLS */}
                <div className="max-w-lg mx-auto bg-slate-950/40 p-4 rounded-xl border border-slate-855 text-left space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">Tutor Synthetic Speaking Configuration:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1">
                        <span>Pitch Modifier</span>
                        <span>{voicePitch}x</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="1.5" 
                        step="0.1" 
                        value={voicePitch}
                        onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer text-xs"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1">
                        <span>Reading Speed</span>
                        <span>{voiceSpeed}x</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="1.8" 
                        step="0.1" 
                        value={voiceSpeed}
                        onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center pt-2">
                  <button
                    onClick={startSession}
                    disabled={isGeneratingQuestions}
                    className="bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white text-slate-300 font-extrabold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-indigo-955/5 cursor-pointer"
                  >
                    Start Preset {sessionMode} Session Track
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Active Question Panel */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9.5px] font-mono text-indigo-400 uppercase tracking-widest font-bold">
                      Question {currentQuestionIdx + 1} of {getActiveQuestionList().length}
                    </span>
                    <span className="text-[9.5px] font-mono text-slate-500 uppercase">
                      Track: {customQuestions ? "AI Customized Stack" : sessionMode}
                    </span>
                  </div>

                  <p className="text-sm font-black text-slate-100 leading-relaxed font-sans">
                    {getActiveQuestionList()[currentQuestionIdx]?.text}
                  </p>
                  
                  {/* Speaker indicator inside page */}
                  <div className="mt-3 flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                    <Volume2 className={`h-3.5 w-3.5 ${isSpeaking ? "text-indigo-400 animate-bounce" : "text-slate-650"}`} />
                    <span>{isSpeaking ? "Virtual spoken sound active..." : "Speech output ready. Press replay anytime."}</span>
                    <button 
                      onClick={() => speakQuestion(getActiveQuestionList()[currentQuestionIdx]?.text)}
                      className="ml-2 text-indigo-400 hover:underline font-bold"
                    >
                      Replay Accent ➔
                    </button>
                  </div>
                </div>

                {/* Sound wave mic arena */}
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-850 flex flex-col items-center justify-center space-y-4 shadow-inner min-h-[170px]">
                  
                  {isRecording ? (
                    <div className="flex items-end justify-center space-x-1 h-14 overflow-hidden mb-3.5 select-none w-full max-w-xs">
                      {speechWaves.map((wave) => {
                        const randomHeight = 20 + Math.random() * 35;
                        const randomDelay = Math.random() * 0.8;
                        return (
                          <div 
                            key={wave} 
                            style={{ height: `${randomHeight}px`, animationDelay: `${randomDelay}s` }} 
                            className="w-1.5 bg-indigo-500 rounded-full animate-pulse transition-all duration-300"
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-14 flex items-center justify-center mb-3.5 text-xs text-slate-500 font-mono text-center max-w-sm">
                      {micError ? (
                        <span className="text-amber-400 font-bold leading-relaxed">⚠️ {micError}</span>
                      ) : (
                        <span className="italic">Mic closed. Click the microphone button below to record your response. Make sure to talk continuously.</span>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleMicToggle}
                    className={`p-4 rounded-full border transition-all cursor-pointer ${
                      isRecording 
                        ? "bg-red-950/40 border-red-500 text-red-100 animate-pulse scale-105" 
                        : "bg-indigo-950/40 border-indigo-550 text-indigo-400"
                    }`}
                  >
                    {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </button>

                  <span className="text-[10px] text-indigo-400 font-bold font-mono">
                    {isRecording ? "🔴 RECORDING LIVE TRANSCRIPT FROM MICROPHONE..." : "CLICK TO RECORD YOUR VERBAL RESPONSE"}
                  </span>
                </div>

                {/* Candidate Speech transcript editable field */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-mono">Live Microphone Word Transcript:</span>
                    {isRecording && (
                      <span className="text-[10px] text-green-400 font-mono animate-pulse flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-green-500 block"></span>
                        Listening actively...
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    value={candidateTranscript}
                    onChange={(e) => setCandidateTranscript(e.target.value)}
                    placeholder="Capture live transcripts here through your mic, or type your answer here if preferred..."
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-xs leading-relaxed font-sans text-slate-200 outline-none focus:border-indigo-500 transition-all font-mono"
                  />
                </div>

                {/* Stage actions */}
                <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-2">
                  <button
                    onClick={() => {
                      setIsSessionActive(false);
                      setCustomQuestions(null);
                    }}
                    className="bg-slate-950 border border-slate-850 text-slate-400 hover:text-white px-4 py-1.5 rounded-lg text-xs"
                  >
                    Cancel Session
                  </button>

                  <div className="flex items-center space-x-2.5">
                    <button
                      onClick={submitVerbalAnswer}
                      disabled={isSyncing || !candidateTranscript.trim()}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-955/20"
                    >
                      {isSyncing ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          Evaluating transcribing metrics...
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" />
                          Submit Voice Answer
                        </>
                      )}
                    </button>

                    {evaluation && (
                      <div className="flex items-center space-x-2.5">
                        {evaluation.followUpQuestion && (
                          <button
                            onClick={handleAnswerFollowUp}
                            className="bg-indigo-950 hover:bg-indigo-900 text-indigo-400 border border-indigo-900/60 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm animate-pulse"
                            title="Continue this thread with the AI's dynamic follow-up question"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                            Answer AI Follow-Up ➔
                          </button>
                        )}
                        <button
                          onClick={nextQuestion}
                          className="bg-slate-955 hover:bg-slate-850 text-slate-300 border border-slate-800 font-bold px-4 py-2 rounded-xl text-xs"
                        >
                          {currentQuestionIdx === getActiveQuestionList().length - 1 ? "Finish Track" : "Next Preset Question ➔"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rendering instant ratings evaluation card */}
                {evaluation && (
                  <div className="bg-slate-955/30 border border-slate-805 rounded-xl p-5 mt-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-indigo-950 pb-2.5">
                      <div className="flex items-center space-x-1.5">
                        <TrendingUp className="h-4 w-4 text-emerald-400 animate-pulse" />
                        <span className="text-xs font-black text-white uppercase tracking-wide">Transcripts Evaluator Audits</span>
                      </div>
                      <span className="text-xs font-black font-mono text-emerald-400">Score: {evaluation.overallRating}%</span>
                    </div>

                    {/* Horizontal score board grids */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                      {[
                        { label: "Confidence", val: evaluation.confidenceRating },
                        { label: "Communication", val: evaluation.communicationRating },
                        { label: "Technical Accuracy", val: evaluation.accuracyRating },
                        { label: "Clarity", val: evaluation.clarityRating },
                        { label: "Problem Solving", val: evaluation.problemSolvingRating }
                      ].map((item) => (
                        <div key={item.label} className="bg-slate-950/80 rounded-xl p-2.5 border border-slate-855/60">
                          <span className="text-[9px] text-slate-500 block leading-tight font-semibold">{item.label}</span>
                          <span className="text-xs font-extrabold font-mono text-white mt-1 block leading-tight">{item.val}%</span>
                        </div>
                      ))}
                    </div>

                    {/* Bullet summary lists */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans text-slate-350 pt-2 leading-relaxed">
                      <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1.5 font-mono">Strengths identified:</span>
                        <ul className="list-disc pl-4 space-y-1">
                          {evaluation.strengths?.map((s: string, idx: number) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1.5 font-mono">Improvements suggested:</span>
                        <ul className="list-disc pl-4 space-y-1">
                          {evaluation.improvements?.map((i: string, idx: number) => (
                            <li key={idx}>{i}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <p className="text-[10.5px] italic text-indigo-300 font-sans leading-relaxed pt-2">
                       <span className="font-bold underline text-white">Gemini Dialogue Follow-Up Question:</span> "{evaluation.followUpQuestion}"
                    </p>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Session history right panel */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-805/80 rounded-2xl p-5 shadow-xl min-h-[380px] flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-1.5 border-b border-slate-800 pb-3 mb-4">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Reports Logbook ({reportHistory.length})</span>
              </div>

              {/* Log items */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto">
                {reportHistory.length === 0 ? (
                  <div className="text-center py-20 text-slate-600 font-mono text-xs italic">
                    Logbook empty. Solve voice tracks to query report lists.
                  </div>
                ) : (
                  reportHistory.map((item, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-855 rounded-xl p-3 text-xs leading-relaxed">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-slate-100 uppercase tracking-wide text-[10px]">{item.mode} Try</span>
                        <span className="font-black text-indigo-400 font-mono">{item.score}%</span>
                      </div>
                      <p className="text-[10.5px] text-slate-450 leading-tight block line-clamp-1 italic text-slate-500">"{item.question}"</p>
                      <span className="text-[9px] text-slate-600 mt-1 block font-mono">{item.date}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3.5 mt-6 text-[10px] text-slate-500 font-mono lowercase text-center">
              speech voice checkpoints fully persistent
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isAdmin?: boolean;
}

export interface Resume {
  id: string;
  userId: string;
  filename: string;
  uploadDate: string;
  resumeScore: number;
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  suggestedImprovements: string[];
}

export interface InterviewSession {
  id: string;
  userId: string;
  role: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  score?: number;
  createdAt: string;
  status: 'active' | 'completed';
  overallScore?: number;
  communicationScore?: number;
  technicalScore?: number;
  confidenceScore?: number;
  improvementAreas?: string[];
  learningPath?: string[];
  // Upgrade fields
  interviewType?: 'text' | 'voice';
  interviewMode?: 'HR' | 'Technical' | 'SystemDesign';
  voiceEvaluation?: VoiceInterviewEvaluation;
}

export interface VoiceInterviewEvaluation {
  confidenceRating: number; // 0-100
  communicationRating: number; // 0-100
  accuracyRating: number; // 0-100
  clarityRating: number; // 0-100
  problemSolvingRating: number; // 0-100
  overallRating: number; // 0-100
  strengths: string[];
  improvements: string[];
  detailedReportText: string;
}

export interface Question {
  id: string;
  sessionId: string;
  question: string;
  answer?: string;
  aiFeedback?: string;
  rating?: number; // Score out of 10 or 100
  audioUrl?: string; // If simulated voice audio
  crucialPointsMissed?: string[];
  areasForImprovement?: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ProjectStats {
  userCount: number;
  totalInterviews: number;
  averageScores: {
    overall: number;
    communication: number;
    technical: number;
    confidence: number;
  };
}

// --- CODING PLAYGROUND MODELS ---
export interface CodeSubmission {
  id: string;
  userId: string;
  problemId: string;
  problemTitle: string;
  language: string;
  code: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
  executionTime: string; // e.g. "42ms" or "0.04s"
  memoryUsage: string; // e.g. "12.4 MB"
  submittedAt: string;
  errorMessage?: string;
}

export interface AutoSavedCode {
  userId: string;
  problemId: string;
  language: string;
  code: string;
  updatedAt: string;
}

// --- DSA PROGRESS TRACKING ---
export interface TopicProgress {
  id: string;
  userId: string;
  topicId: string; // e.g. "Arrays", "Graphs"
  status: 'Not Started' | 'In Progress' | 'Completed';
  lastStudiedAt: string;
}

// --- TOP 100 SHEET PROGRESS ---
export interface SheetQuestionProgress {
  id: string;
  userId: string;
  questionId: string; // e.g. "LC-75-1"
  status: 'Solved' | 'Attempted' | 'Revision Needed';
  updatedAt: string;
}

// --- DAILY CODING MISSION SYSTEMS ---
export interface DailyMissionState {
  userId: string;
  dateStr: string; // YYYY-MM-DD
  easySolved: boolean;
  mediumSolved: boolean;
  hardSolved: boolean;
  easyId: string;
  mediumId: string;
  hardId: string;
}

export interface UserCodingStreak {
  userId: string;
  streakCount: number;
  lastSolvedDate?: string; // YYYY-MM-DD
  problemsSolvedCount: number;
}

// --- PLACEMENT STUDY HUB MODELS ---
export interface PlacementQuizScore {
  id: string;
  userId: string;
  category: string; // e.g. "Aptitude", "Reasoning", "OS", "DBMS"
  score: number; // e.g. 80 meaning 80%
  totalQuestions: number;
  correctAnswers: number;
  attemptedAt: string;
}

export interface PlacementReadinessScore {
  overallScore: number; // 0 - 100
  resumeWeight: number;
  interviewWeight: number;
  codingWeight: number;
  dsaWeight: number;
  readinessLabel: 'Excellent' | 'Good' | 'Average' | 'Needs Focus';
  analysisFeedback: string;
  placementReadinessScore: number;
  recommendations: string[];
  achievements: string[];
  streakCount?: number;
  problemsSolved?: number;
}

export interface SharedDsaSession {
  id: string;
  userId: string | null;
  userName: string | null;
  structure: string;
  stateData: string; // JSON representation of state
  createdAt: string;
}


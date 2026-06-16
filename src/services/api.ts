/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthResponse, User, Resume, InterviewSession, Question, ProjectStats } from "../types";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  auth: {
    register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to register account");
      }
      return res.json();
    },

    login: async (email: string, password: string): Promise<AuthResponse> => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to authenticate credentials");
      }
      return res.json();
    },

    me: async (): Promise<{ user: User }> => {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: getHeaders(),
      });
      if (!res.ok) {
        throw new Error("Expired or invalid session token");
      }
      return res.json();
    },
  },

  resumes: {
    analyze: async (filename: string, resumeText: string): Promise<Resume> => {
      const res = await fetch("/api/resumes/analyze", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ filename, resumeText }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to analyze resume text");
      }
      return res.json();
    },

    getHistory: async (): Promise<Resume[]> => {
      const res = await fetch("/api/resumes/history", {
        method: "GET",
        headers: getHeaders(),
      });
      if (!res.ok) {
        throw new Error("Failed to load resume evaluation history");
      }
      return res.json();
    },
  },

  interviews: {
    getSessions: async (): Promise<(InterviewSession & { progress: number; questionCount: number })[]> => {
      const res = await fetch("/api/interviews/sessions", {
        method: "GET",
        headers: getHeaders(),
      });
      if (!res.ok) {
        throw new Error("Failed to load interview history");
      }
      return res.json();
    },

    getSessionDetails: async (id: string): Promise<{ session: InterviewSession; questions: Question[] }> => {
      const res = await fetch(`/api/interviews/sessions/${id}`, {
        method: "GET",
        headers: getHeaders(),
      });
      if (!res.ok) {
        throw new Error("Failed to fetch session record");
      }
      return res.json();
    },

    createSession: async (role: string, difficulty: 'Easy' | 'Medium' | 'Hard'): Promise<{ session: InterviewSession; questions: Question[] }> => {
      const res = await fetch("/api/interviews/sessions", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ role, difficulty }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to construct next mock interview queue");
      }
      return res.json();
    },

    answerQuestion: async (questionId: string, answer: string): Promise<Question> => {
      const res = await fetch(`/api/interviews/questions/${questionId}/answer`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ answer }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error compiling question evaluation");
      }
      return res.json();
    },

    completeSession: async (sessionId: string): Promise<{ session: InterviewSession; questions: Question[] }> => {
      const res = await fetch(`/api/interviews/sessions/${sessionId}/complete`, {
        method: "POST",
        headers: getHeaders(),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to build comprehensive AI report card");
      }
      return res.json();
    },
  },

  analytics: {
    getMetrics: async (): Promise<{
      interviewTrends: { date: string; score: number; role: string }[];
      skillCategoryChart: { subject: string; A: number }[];
      resumeImprovementTrend: { name: string; score: number; ats: number }[];
    }> => {
      const res = await fetch("/api/analytics", {
        method: "GET",
        headers: getHeaders(),
      });
      if (!res.ok) {
        throw new Error("Error fetching charts metrics summaries");
      }
      return res.json();
    },
  },

  admin: {
    getStats: async (): Promise<ProjectStats> => {
      const res = await fetch("/api/admin/stats", {
        method: "GET",
        headers: getHeaders(),
      });
      if (!res.ok) {
        throw new Error("Failed to fetch administrative metrics summaries");
      }
      return res.json();
    },
  },
};

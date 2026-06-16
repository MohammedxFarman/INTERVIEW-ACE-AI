/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import { User, Resume, InterviewSession, Question, CodeSubmission, AutoSavedCode, TopicProgress, SheetQuestionProgress, DailyMissionState, UserCodingStreak, PlacementQuizScore, SharedDsaSession } from '../src/types';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

// Ensure database directory and file exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

export interface AiCacheEntry {
  key: string; // hash or stringified prompt
  response: string; // stringified JSON or plain text
  expiresAt: string;
}

interface DatabaseSchema {
  users: UserWithPassword[];
  resumes: Resume[];
  interviewSessions: InterviewSession[];
  questions: Question[];
  codeSubmissions: CodeSubmission[];
  autoSavedCodes: AutoSavedCode[];
  topicProgresses: TopicProgress[];
  sheetQuestionProgresses: SheetQuestionProgress[];
  dailyMissions: DailyMissionState[];
  codingStreaks: UserCodingStreak[];
  placementQuizScores: PlacementQuizScore[];
  aiCache: AiCacheEntry[];
  sharedDsaSessions: SharedDsaSession[];
}

export interface UserWithPassword extends User {
  passwordHash: string;
}

const defaultDb: DatabaseSchema = {
  users: [],
  resumes: [],
  interviewSessions: [],
  questions: [],
  codeSubmissions: [],
  autoSavedCodes: [],
  topicProgresses: [],
  sheetQuestionProgresses: [],
  dailyMissions: [],
  codingStreaks: [],
  placementQuizScores: [],
  aiCache: [],
  sharedDsaSessions: []
};

// In-memory cache
let dbCache: DatabaseSchema = { ...defaultDb };

// Load database from file
export function loadDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(data);
      // Ensure compatibility
      if (!dbCache.users) dbCache.users = [];
      if (!dbCache.resumes) dbCache.resumes = [];
      if (!dbCache.interviewSessions) dbCache.interviewSessions = [];
      if (!dbCache.questions) dbCache.questions = [];
      if (!dbCache.codeSubmissions) dbCache.codeSubmissions = [];
      if (!dbCache.autoSavedCodes) dbCache.autoSavedCodes = [];
      if (!dbCache.topicProgresses) dbCache.topicProgresses = [];
      if (!dbCache.sheetQuestionProgresses) dbCache.sheetQuestionProgresses = [];
      if (!dbCache.dailyMissions) dbCache.dailyMissions = [];
      if (!dbCache.codingStreaks) dbCache.codingStreaks = [];
      if (!dbCache.placementQuizScores) dbCache.placementQuizScores = [];
      if (!dbCache.aiCache) dbCache.aiCache = [];
      if (!dbCache.sharedDsaSessions) dbCache.sharedDsaSessions = [];
    } else {
      dbCache = { ...defaultDb };
      saveDb();
    }
  } catch (error) {
    console.error('Failed to load database, using defaults:', error);
    dbCache = { ...defaultDb };
  }
  return dbCache;
}

// Save database to file
export function saveDb(): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save database:', error);
  }
}

// Load DB immediately on import
loadDb();

// --- FIREBASE FIREBASE DRIVER LAYER ---
let db: any = null;
try {
  const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(firebaseConfigPath)) {
    const config = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
    const app = initializeApp(config);
    db = getFirestore(app, config.firestoreDatabaseId);
    console.log("Firebase App initialized successfully in server database driver.");
    
    // Asynchronously synchronize online cloud data from Firestore (Two-way recovery & sync)
    syncFromFirestore();
  } else {
    console.warn("firebase-applet-config.json not found in server workspace root. Firestore is offline.");
  }
} catch (err) {
  console.error("Failed to initialize Firebase applet database driver:", err);
}

// Background firestore sync helpers
async function saveToFirestore(collectionName: string, docId: string, data: any) {
  if (!db) return;
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data);
  } catch (err) {
    console.error(`Firebase Firestore update failed near [${collectionName}/${docId}]:`, err);
  }
}

async function deleteFromFirestore(collectionName: string, docId: string) {
  if (!db) return;
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error(`Firebase Firestore delete failed near [${collectionName}/${docId}]:`, err);
  }
}

async function syncFromFirestore() {
  if (!db) return;
  try {
    console.log("Synchronizing active datasets with remote Firebase database instances...");
    const collections = [
      'users', 'resumes', 'interviewSessions', 'questions',
      'codeSubmissions', 'autoSavedCodes', 'topicProgresses',
      'sheetQuestionProgresses', 'dailyMissions', 'codingStreaks',
      'placementQuizScores', 'sharedDsaSessions'
    ];
    let onlineItemsCount = 0;
    
    for (const colName of collections) {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      const items: any[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data());
      });
      if (items.length > 0) {
        (dbCache as any)[colName] = items;
        onlineItemsCount += items.length;
      }
    }

    if (onlineItemsCount > 0) {
      console.log(`Successfully restored ${onlineItemsCount} records from Cloud Firestore database.`);
      saveDb();
    } else {
      console.log("Pre-seeding Remote Firebase collections using existing local data pools...");
      // Seed if Firestore has 0 documents but we have local items
      for (const colName of collections) {
        const localList = (dbCache as any)[colName] || [];
        for (const item of localList) {
          if (item && typeof item === 'object') {
            const keyId = item.id || 
              (item.userId && item.problemId && item.language ? `${item.userId}_${item.problemId}_${item.language}` : null) || 
              (item.userId && item.dateStr ? `${item.userId}_${item.dateStr}` : null) || 
              item.userId || 
              item.key;
            if (keyId) {
              await saveToFirestore(colName, String(keyId), item);
            }
          }
        }
      }
      console.log("Cloud seeding pipeline completed.");
    }
  } catch (err) {
    console.error("Cloud synchronization workflow encountered an issue:", err);
  }
}

// JWT Secrets and crypto helpers
const JWT_SECRET = process.env.JWT_SECRET || 'interview-ace-ai-secret-key-1337';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === originalHash;
  } catch (err) {
    return false;
  }
}

export function generateToken(user: User): string {
  const payload = JSON.stringify({ userId: user.id, email: user.email, exp: Date.now() + 24 * 60 * 60 * 1000 });
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payload).digest('hex');
  return `${Buffer.from(payload).toString('base64')}.${signature}`;
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;
    const payloadStr = Buffer.from(payloadB64, 'base64').toString();
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(payloadStr).digest('hex');
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(payloadStr);
    if (Date.now() > payload.exp) return null; // Expired
    return payload;
  } catch {
    return null;
  }
}

// Data Access Methods - Users
export const usersDao = {
  create: (name: string, email: string, passwordHash: string): User => {
    const emailLower = email.toLowerCase().trim();
    // First user is Admin
    const isAdmin = dbCache.users.length === 0;
    const newUser: UserWithPassword = {
      id: crypto.randomUUID(),
      name,
      email: emailLower,
      passwordHash,
      createdAt: new Date().toISOString(),
      isAdmin
    };
    dbCache.users.push(newUser);
    saveDb();
    
    // Background Firestore cloud backup
    saveToFirestore('users', newUser.id, newUser);
    
    const { passwordHash: _, ...userSafe } = newUser;
    return userSafe;
  },
  findByEmail: (email: string): UserWithPassword | null => {
    const emailLower = email.toLowerCase().trim();
    const user = dbCache.users.find(u => u.email === emailLower);
    return user || null;
  },
  findById: (id: string): User | null => {
    const user = dbCache.users.find(u => u.id === id);
    if (!user) return null;
    const { passwordHash: _, ...userSafe } = user;
    return userSafe;
  },
  count: (): number => {
    return dbCache.users.length;
  }
};

// Data Access Methods - Resumes
export const resumesDao = {
  create: (resume: Resume): Resume => {
    dbCache.resumes.push(resume);
    saveDb();
    
    // Background Firestore cloud backup
    saveToFirestore('resumes', resume.id, resume);
    
    return resume;
  },
  findByUserId: (userId: string): Resume[] => {
    return dbCache.resumes.filter(r => r.userId === userId);
  },
  findAll: (): Resume[] => {
    return dbCache.resumes;
  }
};

// Data Access Methods - InterviewSessions
export const sessionsDao = {
  create: (session: InterviewSession): InterviewSession => {
    dbCache.interviewSessions.push(session);
    saveDb();
    
    // Background Firestore cloud backup
    saveToFirestore('interviewSessions', session.id, session);
    
    return session;
  },
  findById: (id: string): InterviewSession | null => {
    const session = dbCache.interviewSessions.find(s => s.id === id);
    return session || null;
  },
  findByUserId: (userId: string): InterviewSession[] => {
    return dbCache.interviewSessions.filter(s => s.userId === userId);
  },
  update: (id: string, updates: Partial<InterviewSession>): InterviewSession | null => {
    const idx = dbCache.interviewSessions.findIndex(s => s.id === id);
    if (idx === -1) return null;
    dbCache.interviewSessions[idx] = { ...dbCache.interviewSessions[idx], ...updates } as InterviewSession;
    saveDb();
    
    // Background Firestore cloud backup
    saveToFirestore('interviewSessions', id, dbCache.interviewSessions[idx]);
    
    return dbCache.interviewSessions[idx];
  },
  findAll: (): InterviewSession[] => {
    return dbCache.interviewSessions;
  },
  count: (): number => {
    return dbCache.interviewSessions.length;
  }
};

// Data Access Methods - Questions
export const questionsDao = {
  createMany: (questions: Question[]): Question[] => {
    dbCache.questions.push(...questions);
    saveDb();
    
    // Background Firestore cloud backup
    for (const q of questions) {
      saveToFirestore('questions', q.id, q);
    }
    
    return questions;
  },
  findBySessionId: (sessionId: string): Question[] => {
    return dbCache.questions.filter(q => q.sessionId === sessionId);
  },
  findById: (id: string): Question | null => {
    return dbCache.questions.find(q => q.id === id) || null;
  },
  update: (id: string, updates: Partial<Question>): Question | null => {
    const idx = dbCache.questions.findIndex(q => q.id === id);
    if (idx === -1) return null;
    dbCache.questions[idx] = { ...dbCache.questions[idx], ...updates };
    saveDb();
    
    // Background Firestore cloud backup
    saveToFirestore('questions', id, dbCache.questions[idx]);
    
    return dbCache.questions[idx];
  }
};

// Data Access Methods - Code Submissions
export const codeSubmissionsDao = {
  create: (sub: CodeSubmission): CodeSubmission => {
    dbCache.codeSubmissions.push(sub);
    saveDb();
    
    // Background Firestore cloud backup
    saveToFirestore('codeSubmissions', sub.id, sub);
    
    return sub;
  },
  findByUserId: (userId: string): CodeSubmission[] => {
    return dbCache.codeSubmissions.filter(s => s.userId === userId);
  },
  findByProblemId: (userId: string, problemId: string): CodeSubmission[] => {
    return dbCache.codeSubmissions.filter(s => s.userId === userId && s.problemId === problemId);
  }
};

// Data Access Methods - Auto Saved Codes
export const autoSavedCodesDao = {
  save: (save: AutoSavedCode): AutoSavedCode => {
    const idx = dbCache.autoSavedCodes.findIndex(c => c.userId === save.userId && c.problemId === save.problemId && c.language === save.language);
    if (idx !== -1) {
      dbCache.autoSavedCodes[idx] = save;
    } else {
      dbCache.autoSavedCodes.push(save);
    }
    saveDb();
    
    // Background Firestore cloud backup (composite ID)
    const docId = `${save.userId}_${save.problemId}_${save.language}`;
    saveToFirestore('autoSavedCodes', docId, save);
    
    return save;
  },
  find: (userId: string, problemId: string, language: string): AutoSavedCode | null => {
    return dbCache.autoSavedCodes.find(c => c.userId === userId && c.problemId === problemId && c.language === language) || null;
  }
};

// Data Access Methods - Topic Progress
export const topicProgressesDao = {
  updateStatus: (userId: string, topicId: string, status: TopicProgress['status']): TopicProgress => {
    const idx = dbCache.topicProgresses.findIndex(p => p.userId === userId && p.topicId === topicId);
    const progress: TopicProgress = {
      id: idx !== -1 ? dbCache.topicProgresses[idx].id : crypto.randomUUID(),
      userId,
      topicId,
      status,
      lastStudiedAt: new Date().toISOString()
    };
    if (idx !== -1) {
      dbCache.topicProgresses[idx] = progress;
    } else {
      dbCache.topicProgresses.push(progress);
    }
    saveDb();
    
    // Background Firestore cloud backup
    saveToFirestore('topicProgresses', progress.id, progress);
    
    return progress;
  },
  findByUserId: (userId: string): TopicProgress[] => {
    return dbCache.topicProgresses.filter(p => p.userId === userId);
  }
};

// Data Access Methods - Coding Sheet Progress
export const sheetQuestionProgressesDao = {
  updateStatus: (userId: string, questionId: string, status: SheetQuestionProgress['status']): SheetQuestionProgress => {
    const idx = dbCache.sheetQuestionProgresses.findIndex(p => p.userId === userId && p.questionId === questionId);
    const progress: SheetQuestionProgress = {
      id: idx !== -1 ? dbCache.sheetQuestionProgresses[idx].id : crypto.randomUUID(),
      userId,
      questionId,
      status,
      updatedAt: new Date().toISOString()
    };
    if (idx !== -1) {
      dbCache.sheetQuestionProgresses[idx] = progress;
    } else {
      dbCache.sheetQuestionProgresses.push(progress);
    }
    saveDb();
    
    // Background Firestore cloud backup
    saveToFirestore('sheetQuestionProgresses', progress.id, progress);
    
    return progress;
  },
  findByUserId: (userId: string): SheetQuestionProgress[] => {
    return dbCache.sheetQuestionProgresses.filter(p => p.userId === userId);
  }
};

// Data Access Methods - Daily Coding Mission State
export const dailyMissionsDao = {
  getOrCreate: (userId: string, dateStr: string, defaults: Omit<DailyMissionState, 'userId' | 'dateStr'>): DailyMissionState => {
    let mission = dbCache.dailyMissions.find(m => m.userId === userId && m.dateStr === dateStr);
    if (!mission) {
      mission = {
        userId,
        dateStr,
        ...defaults
      };
      dbCache.dailyMissions.push(mission);
      saveDb();
      
      // Background Firestore cloud backup
      const docId = `${userId}_${dateStr}`;
      saveToFirestore('dailyMissions', docId, mission);
    }
    return mission;
  },
  solve: (userId: string, dateStr: string, difficulty: 'easy' | 'medium' | 'hard'): DailyMissionState | null => {
    const idx = dbCache.dailyMissions.findIndex(m => m.userId === userId && m.dateStr === dateStr);
    if (idx === -1) return null;
    if (difficulty === 'easy') dbCache.dailyMissions[idx].easySolved = true;
    if (difficulty === 'medium') dbCache.dailyMissions[idx].mediumSolved = true;
    if (difficulty === 'hard') dbCache.dailyMissions[idx].hardSolved = true;
    saveDb();
    
    // Background Firestore cloud backup
    const docId = `${userId}_${dateStr}`;
    saveToFirestore('dailyMissions', docId, dbCache.dailyMissions[idx]);
    
    return dbCache.dailyMissions[idx];
  },
  findByUserId: (userId: string): DailyMissionState[] => {
    return dbCache.dailyMissions.filter(m => m.userId === userId);
  }
};

// Data Access Methods - Coding Streak & Stats
export const codingStreaksDao = {
  getOrCreate: (userId: string): UserCodingStreak => {
    let streak = dbCache.codingStreaks.find(s => s.userId === userId);
    if (!streak) {
      streak = {
        userId,
        streakCount: 0,
        problemsSolvedCount: 0
      };
      dbCache.codingStreaks.push(streak);
      saveDb();
      
      // Background Firestore cloud backup
      saveToFirestore('codingStreaks', userId, streak);
    }
    return streak;
  },
  incrementStreak: (userId: string, dateStr: string): UserCodingStreak => {
    const streak = codingStreaksDao.getOrCreate(userId);
    
    // Check if solved today or yesterday to adjust streak
    if (streak.lastSolvedDate !== dateStr) {
      if (streak.lastSolvedDate) {
        const lastDate = new Date(streak.lastSolvedDate);
        const todayDate = new Date(dateStr);
        const diffDays = Math.ceil((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          streak.streakCount += 1;
        } else if (diffDays > 1) {
          streak.streakCount = 1; // broken and restarted
        }
      } else {
        streak.streakCount = 1; // first problem ever
      }
      streak.lastSolvedDate = dateStr;
    }
    
    streak.problemsSolvedCount += 1;
    
    const idx = dbCache.codingStreaks.findIndex(s => s.userId === userId);
    dbCache.codingStreaks[idx] = streak;
    saveDb();
    
    // Background Firestore cloud backup
    saveToFirestore('codingStreaks', userId, streak);
    
    return streak;
  }
};

// Data Access Methods - Placement Study Hub Scores
export const placementQuizScoresDao = {
  recordScore: (scoreObj: Omit<PlacementQuizScore, 'id' | 'attemptedAt'>): PlacementQuizScore => {
    const attempt: PlacementQuizScore = {
      id: crypto.randomUUID(),
      ...scoreObj,
      attemptedAt: new Date().toISOString()
    };
    dbCache.placementQuizScores.push(attempt);
    saveDb();
    
    // Background Firestore cloud backup
    saveToFirestore('placementQuizScores', attempt.id, attempt);
    
    return attempt;
  },
  findByUserId: (userId: string): PlacementQuizScore[] => {
    return dbCache.placementQuizScores.filter(s => s.userId === userId);
  }
};

// Data Access Methods - Gemini Cache (Cost Optimization, caching explanations for generic topics)
export const aiCacheDao = {
  get: (key: string): string | null => {
    const entry = dbCache.aiCache.find(e => e.key === key);
    if (!entry) return null;
    if (new Date() > new Date(entry.expiresAt)) {
      // Remove expired
      dbCache.aiCache = dbCache.aiCache.filter(e => e.key !== key);
      saveDb();
      return null;
    }
    return entry.response;
  },
  set: (key: string, response: string, ttlDays: number = 7): string => {
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString();
    const entry = { key, response, expiresAt };
    const idx = dbCache.aiCache.findIndex(e => e.key === key);
    if (idx !== -1) {
      dbCache.aiCache[idx] = entry;
    } else {
      dbCache.aiCache.push(entry);
    }
    saveDb();
    
    // Back up to firestore (use MD5 of key to avoid illegal characters in key strings)
    const secureKeyId = crypto.createHash('md5').update(key).digest('hex');
    saveToFirestore('aiCache', secureKeyId, entry);
    
    return response;
  }
};

// Data Access Methods - Shared DSA Sessions
export const sharedDsaSessionsDao = {
  create: (sessionObj: Omit<SharedDsaSession, 'id' | 'createdAt'>): SharedDsaSession => {
    const session: SharedDsaSession = {
      id: crypto.randomUUID(),
      ...sessionObj,
      createdAt: new Date().toISOString()
    };
    dbCache.sharedDsaSessions.push(session);
    saveDb();
    
    // Background Firestore cloud backup
    saveToFirestore('sharedDsaSessions', session.id, session);
    
    return session;
  },
  findById: (id: string): SharedDsaSession | null => {
    return dbCache.sharedDsaSessions.find(s => s.id === id) || null;
  }
};

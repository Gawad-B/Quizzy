import { http } from '../lib/http';
import type { User, Quiz } from './mockData';

export interface SubjectSummary {
  id: string;
  name: string;
  quiz_count: number;
  avg_score: number;
}

export interface OverviewStats {
  totalQuizzes: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  partialAnswers: number;
  averageScore: number;
  totalTime: number;
  averageTimePerQuestion: number;
  currentStreak: number;
  bestStreak: number;
  subjects: Array<{
    name: string;
    score: number;
    questions: number;
    correct: number;
    wrong: number;
  }>;
  recentQuizzes: Array<{
    name: string;
    score: number;
    date: string;
    questions: number;
    subject: string;
    image?: string;
    status: 'Finished' | 'Unfinished';
  }>;
}

export interface AnalysisResponse {
  chapters: Array<{
    id: string;
    name: string;
    score: number;
    questions: number;
    correct: number;
    wrong: number;
    trend: 'up' | 'down';
    timeSpent: number;
  }>;
  performance: {
    overallScore: number;
    strongAreas: string[];
    weakAreas: string[];
    questionTypes: Record<string, number>;
  };
}

export interface QuizHistoryItem extends Omit<Quiz, 'subject' | 'image'> {
  subject?: string | null;
  image?: string | null;
}

export const userAPI = {
  getById: async (): Promise<User> => {
    const resp = await http<{ success: boolean; user?: User }>('/api/auth/me');
    if (resp.user) {
      return resp.user;
    }
    throw new Error('Failed to fetch user');
  },

  getQuizzes: async (userId: string = 'me'): Promise<QuizHistoryItem[]> => {
    return http<QuizHistoryItem[]>(`/api/users/${userId}/quizzes`);
  },

  getOverview: async (userId: string = 'me'): Promise<OverviewStats> => {
    return http<OverviewStats>(`/api/users/${userId}/overview`);
  },

  getSubjects: async (userId: string = 'me'): Promise<SubjectSummary[]> => {
    return http<SubjectSummary[]>(`/api/users/${userId}/subjects`);
  },

  getAnalysisBySubject: async (subjectId: string, userId: string = 'me'): Promise<AnalysisResponse> => {
    return http<AnalysisResponse>(`/api/users/${userId}/analysis/${subjectId}`);
  },
};

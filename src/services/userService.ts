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
    durationSeconds: number;
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

export interface CreateQuizPayload {
  title: string;
  subject: string;
  totalQuestions: number;
  examMode?: 'solved' | 'new' | 'bookmarked' | 'all';
  category?: string;
  subcategory?: string;
  status?: 'Finished' | 'Unfinished';
  score?: number;
  date?: string;
}

export interface UpdateQuizPayload {
  status?: 'Finished' | 'Unfinished';
  score?: number;
  durationSeconds?: number;
  attempts?: Array<{
    questionId: string;
    selectedAnswer?: string;
    timeSpentSeconds?: number;
  }>;
}

export interface QuizMutationResponse {
  success: boolean;
  quiz?: {
    id: string;
    title: string;
    score: number;
    totalQuestions: number;
    status: 'Finished' | 'Unfinished';
    date: string;
  };
  message?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: string | null;
  explanation?: string | null;
  category?: string | null;
  subcategory?: string | null;
  subject?: string | null;
  isBookmarked: boolean;
}

export interface QuizQuestionsResponse {
  success: boolean;
  questions: QuizQuestion[];
}

export interface QuizReviewQuestion {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: string | null;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  explanation?: string | null;
  category?: string | null;
  subcategory?: string | null;
  timeSpentSeconds: number;
}

export interface QuizReviewResponse {
  success: boolean;
  quiz: QuizHistoryItem;
  questions: QuizReviewQuestion[];
}

export interface BookmarkResponse {
  success: boolean;
  bookmarked?: boolean;
  bookmarks?: Array<{
    id: string;
    question: string;
    explanation?: string | null;
    category?: string | null;
    subcategory?: string | null;
    subject?: string | null;
    bookmarked_at?: string;
  }>;
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

  createQuiz: async (payload: CreateQuizPayload, userId: string = 'me'): Promise<QuizMutationResponse> => {
    return http<QuizMutationResponse>(`/api/users/${userId}/quizzes`, {
      method: 'POST',
      body: payload,
    });
  },

  updateQuiz: async (quizId: string, payload: UpdateQuizPayload, userId: string = 'me'): Promise<QuizMutationResponse> => {
    return http<QuizMutationResponse>(`/api/users/${userId}/quizzes/${quizId}`, {
      method: 'PATCH',
      body: payload,
    });
  },

  getQuizQuestions: async (quizId: string, userId: string = 'me'): Promise<QuizQuestionsResponse> => {
    return http<QuizQuestionsResponse>(`/api/users/${userId}/quizzes/${quizId}/questions`);
  },

  getQuizReview: async (quizId: string, userId: string = 'me'): Promise<QuizReviewResponse> => {
    return http<QuizReviewResponse>(`/api/users/${userId}/quizzes/${quizId}/review`);
  },

  setQuestionBookmark: async (
    questionId: string,
    bookmarked: boolean,
    userId: string = 'me'
  ): Promise<BookmarkResponse> => {
    return http<BookmarkResponse>(`/api/users/${userId}/questions/${questionId}/bookmark`, {
      method: 'POST',
      body: { bookmarked },
    });
  },

  getBookmarkedQuestions: async (
    filters: { subject?: string; category?: string; subcategory?: string } = {},
    userId: string = 'me'
  ): Promise<BookmarkResponse> => {
    const params = new URLSearchParams();

    if (filters.subject) {
      params.set('subject', filters.subject);
    }
    if (filters.category) {
      params.set('category', filters.category);
    }
    if (filters.subcategory) {
      params.set('subcategory', filters.subcategory);
    }

    const queryString = params.toString();
    const path = queryString
      ? `/api/users/${userId}/bookmarks?${queryString}`
      : `/api/users/${userId}/bookmarks`;

    return http<BookmarkResponse>(path);
  },
};

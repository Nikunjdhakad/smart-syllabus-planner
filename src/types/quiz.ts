export type QuizStatus = "mastered" | "completed" | "revision_required" | "restudy_required" | "in_progress" | "abandoned";

export type QuizDifficulty = "very_small" | "small" | "medium" | "large" | "very_large";

export interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
  userAnswer?: string | null;
  isCorrect?: boolean | null;
  timeSpent?: number;
}

export interface Quiz {
  quizId: string;
  userId: string;
  taskId: string;
  topicId: string;
  subjectId: string;
  topicName: string;
  subjectName: string;
  questionCount: number;
  timeLimit: number;
  questions: QuizQuestion[];
  answers: Record<number, string>;
  score: number;
  percentage: number;
  status: QuizStatus;
  startedAt: string;
  completedAt?: string | null;
  timeSpent: number;
  isValid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizGenerationParams {
  topicId: string;
  subjectId: string;
  topicName: string;
  subjectName: string;
  syllabusContent?: string;
  topicDescription?: string;
  difficulty?: QuizDifficulty;
}

export interface QuizSubmission {
  quizId: string;
  answers: Record<number, string>;
  timeSpent: number;
}

export interface QuizResult {
  quizId: string;
  score: number;
  percentage: number;
  status: QuizStatus;
  correctAnswers: number;
  incorrectAnswers: number;
  feedback: string;
  nextAction: string;
  questions: QuizQuestion[];
}

export interface QuizAnalytics {
  totalQuizzes: number;
  averageScore: number;
  masteredTopics: number;
  weakTopics: string[];
  strongTopics: string[];
  knowledgeAccuracy: number;
  subjectPerformance: {
    subjectId: string;
    subjectName: string;
    averageScore: number;
    quizzesTaken: number;
  }[];
  recentTrend: {
    date: string;
    score: number;
  }[];
}

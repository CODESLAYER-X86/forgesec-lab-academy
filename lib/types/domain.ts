export type AppRole = "student" | "instructor" | "admin";
export type ContentType = "tutorial" | "learning_path" | "writeup" | "guide" | "reference" | "glossary";
export type QuizStatus = "draft" | "published" | "archived";
export type QuestionType =
  | "single_choice"
  | "multiple_select"
  | "true_false"
  | "command_input";
export type AssignmentStatus = "draft" | "published" | "archived";
export type AssignmentProgressStatus = "not_started" | "in_progress" | "completed";
export type AccountStatus = "active" | "deactivated" | "deletion_requested";

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  bio: string;
  interests: string[];
  role: AppRole;
  isPermanentAdmin: boolean;
  canManageQuizzes: boolean;
  canManageAssignments: boolean;
  accountStatus: AccountStatus;
  deletionRequestedAt?: string;
  createdAt: string;
  authMode: "supabase" | "preview";
}

export interface LessonProgressRecord {
  userId: string;
  lessonId: string;
  pathId: string;
  completed: boolean;
  completedAt: string | null;
  updatedAt: string;
}

export interface BookmarkRecord {
  id: string;
  userId: string;
  contentId: string;
  contentType: ContentType;
  title: string;
  slug: string;
  createdAt: string;
}

export interface ContentActivityRecord {
  id: string;
  userId: string;
  contentId: string;
  contentType: ContentType;
  title: string;
  slug: string;
  viewedAt: string;
}

export interface QuizOptionPublic {
  id: string;
  label: string;
  optionText: string;
  sortOrder: number;
}

export interface QuizQuestionPublic {
  id: string;
  prompt: string;
  questionType: QuestionType;
  sortOrder: number;
  options: QuizOptionPublic[];
  placeholder?: string;
}

export interface PublicQuiz {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  lessonId?: string;
  passPercentage: number;
  status: QuizStatus;
  questions: QuizQuestionPublic[];
}

export interface QuizQuestionServer extends QuizQuestionPublic {
  explanation: string;
  correctOptionIds: string[];
  acceptedAnswers?: string[];
}

export interface ServerQuiz extends Omit<PublicQuiz, "questions"> {
  questions: QuizQuestionServer[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestionReview {
  questionId: string;
  prompt: string;
  questionType?: QuestionType;
  selectedOptionIds: string[];
  correctOptionIds: string[];
  submittedText?: string;
  expectedAnswer?: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizAttemptRecord {
  id: string;
  quizId: string;
  quizSlug: string;
  quizTitle: string;
  userId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  reviews?: QuizQuestionReview[];
}

export interface PracticalAssignment {
  id: string;
  slug: string;
  title: string;
  objective: string;
  category: string;
  difficulty: string;
  lessonId?: string;
  prerequisites: string[];
  instructions: string[];
  expectedOutcome: string;
  safetyWarning: string;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentProgressRecord {
  userId: string;
  assignmentId: string;
  status: AssignmentProgressStatus;
  notes: string;
  completedAt: string | null;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface PlatformAnalytics {
  totalUsers: number;
  activeLearners: number;
  totalLessonCompletions: number;
  totalQuizAttempts: number;
  averageQuizPassRate: number;
  assignmentCompletionRate: number;
  pathStats: Array<{
    pathId: string;
    title: string;
    totalLessons: number;
    completions: number;
    completionRate: number;
  }>;
  popularLessons: Array<{
    lessonId: string;
    title: string;
    slug: string;
    views: number;
    completions: number;
  }>;
  quizPerformance: Array<{
    quizId: string;
    title: string;
    attempts: number;
    passRate: number;
    avgScore: number;
  }>;
}

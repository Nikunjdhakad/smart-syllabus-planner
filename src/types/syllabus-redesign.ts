/**
 * TypeScript interfaces for the Syllabus Page Redesign
 * 
 * This file defines all state management interfaces and prop types
 * for the redesigned Syllabus Intelligence Center components.
 * 
 * Requirements: Requirement 35 (Input validation and sanitization through proper TypeScript types)
 */

import type { SyllabusItem, SubjectItem, TopicItem } from "./syllabus";

/**
 * Upload mode state for the syllabus manager
 * - idle: No upload in progress, default state
 * - selecting: User is choosing upload method (PDF/Image/Manual)
 * - uploading: File/text is being uploaded to server
 * - processing: AI extraction is in progress
 * - complete: Extraction completed successfully
 */
export type UploadMode = "idle" | "selecting" | "uploading" | "processing" | "complete";

/**
 * Upload method selection
 * - pdf: Upload PDF file
 * - image: Upload image file(s)
 * - manual: Manual text entry
 */
export type UploadMethod = "pdf" | "image" | "manual" | null;

/**
 * AI Processing stages for timeline visualization
 */
export type ProcessingStage =
  | "uploaded"
  | "analyzing"
  | "extracting"
  | "creating"
  | "completed";

/**
 * Main state interface for SyllabusManager component
 * 
 * This interface defines all state required for the redesigned syllabus page,
 * including upload flow state, fetched data, UI state, and error handling.
 */
export interface SyllabusManagerState {
  // Upload flow state
  uploadMode: UploadMode;
  selectedMethod: UploadMethod;
  
  // Data state (fetched from APIs)
  syllabi: SyllabusItem[];
  subjects: SubjectItem[];
  topics: TopicItem[];
  
  // UI state
  expandedSubjectId: string | null;
  isLoadingSyllabi: boolean;
  isUploading: boolean;
  extractionProgress: number;
  currentProcessingStage: ProcessingStage;
  
  // Error handling
  error: string | null;
  errorType: "upload" | "extraction" | "fetch" | null;
}

/**
 * Derived metrics calculated from syllabus data
 * 
 * These metrics are computed from subjects and topics data
 * and displayed in the Syllabus Overview Card and AI Insights Panel.
 */
export interface DerivedMetrics {
  // Overview metrics
  totalSubjects: number;
  totalTopics: number;
  estimatedStudyHours: number;
  estimatedCompletionWeeks: number;
  
  // AI Insights
  mostDifficultSubject: SubjectItem | null;
  largestSubject: SubjectItem | null;
  quickestSubject: SubjectItem | null;
  recommendedFocus: SubjectItem | null;
  
  // Subject-specific metrics
  subjectMetrics: SubjectMetrics[];
}

/**
 * Metrics calculated for individual subjects
 */
export interface SubjectMetrics {
  subjectId: string;
  subjectName: string;
  topicCount: number;
  averageDifficulty: number;
  totalStudyHours: number;
}

/**
 * Props for UploadHero component
 */
export interface UploadHeroProps {
  onUploadClick: () => void;
}

/**
 * Props for UploadExperience component
 */
export interface UploadExperienceProps {
  selectedMethod: UploadMethod;
  onMethodSelect: (method: UploadMethod) => void;
  onFileUpload?: (file: File, method: "pdf" | "image") => void;
  onManualSubmit?: (text: string) => void;
  isUploading?: boolean;
  error?: string | null;
}

/**
 * Props for AIProcessingTimeline component
 */
export interface AIProcessingTimelineProps {
  currentStage: ProcessingStage;
  progress: number;
  onRetry?: () => void;
  error?: string | null;
}

/**
 * Props for SyllabusOverviewCard component
 */
export interface SyllabusOverviewCardProps {
  subjectsCount: number;
  topicsCount: number;
  estimatedHours: number;
  estimatedWeeks: number;
}

/**
 * Props for SubjectExplorer component
 */
export interface SubjectExplorerProps {
  subjects: SubjectItem[];
  expandedSubjectId: string | null;
  onToggleExpand: (subjectId: string) => void;
  isLoading?: boolean;
}

/**
 * Props for SubjectCard component
 */
export interface SubjectCardProps {
  subjectId: string;
  subjectName: string;
  topics: TopicItem[];
  isExpanded: boolean;
  onToggle: () => void;
  averageDifficulty?: number;
  totalStudyHours?: number;
}

/**
 * Props for TopicChip component
 */
export interface TopicChipProps {
  topicId: string;
  topicName: string;
  difficulty: number;
  status?: string;
}

/**
 * Props for AIInsightsPanel component
 */
export interface AIInsightsPanelProps {
  subjects: SubjectItem[];
  derivedMetrics?: DerivedMetrics;
}

/**
 * Props for NextStepCTA component
 */
export interface NextStepCTAProps {
  onGeneratePlan?: () => void;
  disabled?: boolean;
}

/**
 * Utility type for file upload validation
 */
export interface FileUploadValidation {
  isValid: boolean;
  error?: string;
  file?: File;
}

/**
 * Constants for validation
 */
export const VALIDATION_CONSTANTS = {
  MAX_FILE_SIZE_MB: 10,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  MAX_MANUAL_TEXT_LENGTH: 50000,
  MIN_MANUAL_TEXT_LENGTH: 10,
  ACCEPTED_PDF_TYPES: ["application/pdf"],
  ACCEPTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
} as const;

/**
 * Utility type for upload form data
 */
export interface UploadFormData {
  title: string;
  file?: File;
  rawContent?: string;
  sourceType: "pdf" | "image" | "manual";
}

/**
 * Type guard to check if a method requires file upload
 */
export function isFileUploadMethod(method: UploadMethod): method is "pdf" | "image" {
  return method === "pdf" || method === "image";
}

/**
 * Type guard to check if a method is manual entry
 */
export function isManualEntryMethod(method: UploadMethod): method is "manual" {
  return method === "manual";
}

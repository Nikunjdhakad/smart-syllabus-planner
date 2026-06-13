"use client";

import { useState } from "react";
import {
  CalendarDays,
  Clock,
  BookOpen,
  Flame,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Target,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { SubjectItem, SyllabusItem } from "@/types/syllabus";

// ─── TYPES ──────────────────────────────────────────────────────

interface CreatePlanWizardProps {
  syllabi: SyllabusItem[];
  subjects: SubjectItem[];
  onSubmit: (data: {
    title: string;
    examDate: string;
    dailyStudyHours: number;
    syllabusIds: string[];
    weakSubjects: string[];
  }) => Promise<void>;
  onCancel: () => void;
  generating: boolean;
}

type WizardStep = "exam-info" | "study-hours" | "syllabi" | "weak-subjects" | "review";

// ─── CONSTANTS ──────────────────────────────────────────────────

const STUDY_HOUR_OPTIONS = [
  { value: 1, label: "1 Hour", subtitle: "Light pace" },
  { value: 2, label: "2 Hours", subtitle: "Recommended" },
  { value: 3, label: "3 Hours", subtitle: "Intensive" },
  { value: 4, label: "4+ Hours", subtitle: "Maximum" },
];

const QUICK_DATE_OPTIONS = [
  { label: "Next Week", days: 7 },
  { label: "2 Weeks", days: 14 },
  { label: "1 Month", days: 30 },
];

// ─── HELPERS ────────────────────────────────────────────────────

function getDateFromDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0]!;
}

function getDaysUntil(dateString: string): number {
  if (!dateString) return 0;
  const exam = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  exam.setHours(0, 0, 0, 0);
  return Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────

export function CreatePlanWizard({ syllabi, subjects, onSubmit, onCancel, generating }: CreatePlanWizardProps) {
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>("exam-info");
  
  // Form data
  const [title, setTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [dailyStudyHours, setDailyStudyHours] = useState(2);
  const [customHours, setCustomHours] = useState("");
  const [selectedSyllabusIds, setSelectedSyllabusIds] = useState<string[]>(
    syllabi.length === 1 ? [syllabi[0]!.syllabusId] : [],
  );
  const [weakSubjectIds, setWeakSubjectIds] = useState<string[]>([]);

  // Computed values
  const daysUntilExam = getDaysUntil(examDate);
  const estimatedStudyHours = daysUntilExam * dailyStudyHours;
  const selectedSubjects = subjects.filter((s) =>
    selectedSyllabusIds.some((syllabusId) => {
      const syllabus = syllabi.find((syl) => syl.syllabusId === syllabusId);
      return syllabus; // Simplified - in real app, check if subject belongs to syllabus
    }),
  );

  // Step navigation
  const steps: WizardStep[] = ["exam-info", "study-hours", "syllabi", "weak-subjects", "review"];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const canGoNext = () => {
    switch (currentStep) {
      case "exam-info":
        return title.trim() && examDate && daysUntilExam > 0;
      case "study-hours":
        return dailyStudyHours > 0;
      case "syllabi":
        return selectedSyllabusIds.length > 0;
      case "weak-subjects":
        return true; // Optional step
      case "review":
        return true;
      default:
        return false;
    }
  };

  const goNext = () => {
    if (!canGoNext()) return;
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]!);
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]!);
    }
  };

  const handleSubmit = async () => {
    await onSubmit({
      title: title.trim(),
      examDate,
      dailyStudyHours,
      syllabusIds: selectedSyllabusIds,
      weakSubjects: weakSubjectIds,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl rounded-3xl border border-primary/20 bg-card shadow-2xl shadow-primary/10 overflow-hidden"
      >
        {/* Header */}
        <div className="border-b border-border/60 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
                <Sparkles className="size-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Create Study Plan</h2>
                <p className="text-sm text-muted-foreground">Let AI build your personalized schedule</p>
              </div>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={onCancel} className="shrink-0">
              ×
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <span className="font-semibold text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border/30">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-8 min-h-[400px] max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* STEP 1: Exam Information */}
            {currentStep === "exam-info" && (
              <motion.div
                key="exam-info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <CalendarDays className="size-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">When is your exam?</h3>
                  <p className="text-muted-foreground">Choose your exam date and give your plan a name</p>
                </div>

                {/* Plan Title */}
                <div className="space-y-2">
                  <Label htmlFor="wizard-title" className="text-sm font-semibold">
                    Plan Name
                  </Label>
                  <Input
                    id="wizard-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Final Exam Prep"
                    className="h-14 text-lg"
                    autoFocus
                  />
                </div>

                {/* Quick Date Options */}
                <div className="grid grid-cols-3 gap-3">
                  {QUICK_DATE_OPTIONS.map((option) => {
                    const optionDate = getDateFromDays(option.days);
                    const isSelected = examDate === optionDate;
                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => setExamDate(optionDate)}
                        className={cn(
                          "rounded-xl border p-4 text-center transition-all",
                          isSelected
                            ? "border-primary/50 bg-primary/15 text-primary shadow-md"
                            : "border-border/60 hover:border-primary/30 hover:bg-muted/40",
                        )}
                      >
                        <p className="font-semibold">{option.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{option.days} days</p>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Date */}
                <div className="space-y-2">
                  <Label htmlFor="wizard-date" className="text-sm font-semibold">
                    Or choose custom date
                  </Label>
                  <Input
                    id="wizard-date"
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="h-14 text-lg [color-scheme:dark]"
                  />
                </div>

                {/* AI Hint */}
                {daysUntilExam > 0 && (
                  <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <Sparkles className="size-5 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">You have {daysUntilExam} days</span> until your exam.
                      {daysUntilExam < 7 && " That's tight — let's make every day count!"}
                      {daysUntilExam >= 7 && daysUntilExam < 30 && " Perfect timing for a solid study plan."}
                      {daysUntilExam >= 30 && " Great! Plenty of time to master everything."}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2: Study Hours */}
            {currentStep === "study-hours" && (
              <motion.div
                key="study-hours"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <Clock className="size-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">How much time can you study daily?</h3>
                  <p className="text-muted-foreground">Choose what works best for your schedule</p>
                </div>

                {/* Study Hour Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {STUDY_HOUR_OPTIONS.map((option) => {
                    const isSelected = dailyStudyHours === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setDailyStudyHours(option.value);
                          setCustomHours("");
                        }}
                        className={cn(
                          "rounded-2xl border p-6 text-center transition-all",
                          isSelected
                            ? "border-primary/50 bg-primary/15 text-primary shadow-lg ring-2 ring-primary/30"
                            : "border-border/60 hover:border-primary/30 hover:bg-muted/40",
                        )}
                      >
                        {isSelected && (
                          <div className="flex justify-center mb-2">
                            <div className="flex size-6 items-center justify-center rounded-full bg-primary text-white">
                              <Check className="size-4" />
                            </div>
                          </div>
                        )}
                        <p className="text-3xl font-bold mb-1">{option.value}</p>
                        <p className="text-lg font-semibold mb-1">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.subtitle}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Hours */}
                <div className="space-y-2">
                  <Label htmlFor="custom-hours" className="text-sm font-semibold">
                    Or enter custom hours
                  </Label>
                  <Input
                    id="custom-hours"
                    type="number"
                    min={0.5}
                    max={16}
                    step={0.5}
                    value={customHours}
                    onChange={(e) => {
                      setCustomHours(e.target.value);
                      if (e.target.value) {
                        setDailyStudyHours(Number(e.target.value));
                      }
                    }}
                    placeholder="e.g. 2.5"
                    className="h-14 text-lg"
                  />
                </div>

                {/* AI Hint */}
                {daysUntilExam > 0 && dailyStudyHours > 0 && (
                  <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <TrendingUp className="size-5 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground">
                      With <span className="font-semibold">{dailyStudyHours}h per day for {daysUntilExam} days</span>,
                      you'll have <span className="font-semibold">{estimatedStudyHours} total study hours</span>.
                      {estimatedStudyHours < 20 && " That's limited — AI will prioritize the essentials."}
                      {estimatedStudyHours >= 20 && estimatedStudyHours < 50 && " Perfect for comprehensive coverage!"}
                      {estimatedStudyHours >= 50 && " Excellent! You'll master everything thoroughly."}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: Syllabi Selection */}
            {currentStep === "syllabi" && (
              <motion.div
                key="syllabi"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <BookOpen className="size-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Which subjects to include?</h3>
                  <p className="text-muted-foreground">Select the syllabi you want to study</p>
                </div>

                {/* Syllabus Cards */}
                <div className="space-y-3">
                  {syllabi.map((syllabus) => {
                    const isSelected = selectedSyllabusIds.includes(syllabus.syllabusId);
                    return (
                      <button
                        key={syllabus.syllabusId}
                        type="button"
                        onClick={() => {
                          setSelectedSyllabusIds((prev) =>
                            isSelected
                              ? prev.filter((id) => id !== syllabus.syllabusId)
                              : [...prev, syllabus.syllabusId],
                          );
                        }}
                        className={cn(
                          "w-full rounded-xl border p-6 text-left transition-all",
                          isSelected
                            ? "border-primary/50 bg-primary/15 shadow-md ring-2 ring-primary/30"
                            : "border-border/60 hover:border-primary/30 hover:bg-muted/40",
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={cn(
                                "flex size-8 items-center justify-center rounded-lg",
                                isSelected ? "bg-primary/20" : "bg-muted/50",
                              )}>
                                <BookOpen className={cn("size-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                              </div>
                              <h4 className={cn("text-lg font-semibold", isSelected && "text-primary")}>
                                {syllabus.title}
                              </h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {syllabus.extractionStatus === "completed" ? "Ready to study" : "Processing..."}
                            </p>
                          </div>

                          {/* Checkmark */}
                          <div className={cn(
                            "flex size-7 items-center justify-center rounded-full border-2 transition-all",
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-border/60 bg-transparent",
                          )}>
                            {isSelected && <Check className="size-4" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* AI Hint */}
                {selectedSyllabusIds.length > 0 && (
                  <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <Sparkles className="size-5 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{selectedSyllabusIds.length} {selectedSyllabusIds.length === 1 ? "syllabus" : "syllabi"} selected.</span>
                      {" "}AI will create a comprehensive study schedule covering all topics.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 4: Weak Subjects */}
            {currentStep === "weak-subjects" && (
              <motion.div
                key="weak-subjects"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <Flame className="size-16 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Which subjects need extra attention?</h3>
                  <p className="text-muted-foreground">AI will allocate more study time to these (optional)</p>
                </div>

                {/* Subject Cards */}
                {selectedSubjects.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedSubjects.map((subject) => {
                      const isWeak = weakSubjectIds.includes(subject.subjectId);
                      return (
                        <button
                          key={subject.subjectId}
                          type="button"
                          onClick={() => {
                            setWeakSubjectIds((prev) =>
                              isWeak
                                ? prev.filter((id) => id !== subject.subjectId)
                                : [...prev, subject.subjectId],
                            );
                          }}
                          className={cn(
                            "rounded-xl border p-5 text-center transition-all",
                            isWeak
                              ? "border-amber-500/50 bg-amber-500/15 text-amber-500 shadow-md"
                              : "border-border/60 hover:border-amber-500/30 hover:bg-muted/40",
                          )}
                        >
                          {isWeak && (
                            <div className="flex justify-center mb-2">
                              <Flame className="size-5 text-amber-500" />
                            </div>
                          )}
                          <p className={cn("font-semibold", isWeak && "text-amber-500")}>
                            {subject.subjectName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {isWeak ? "Extra focus" : "Normal pace"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No subjects available. Select syllabi first.</p>
                  </div>
                )}

                {/* AI Hint */}
                {weakSubjectIds.length > 0 && (
                  <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <Flame className="size-5 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground">
                      AI will prioritize{" "}
                      <span className="font-semibold">{weakSubjectIds.length} {weakSubjectIds.length === 1 ? "subject" : "subjects"}</span>
                      {" "}with additional study tasks and more revision sessions.
                    </p>
                  </div>
                )}

                {/* Skip hint */}
                {weakSubjectIds.length === 0 && selectedSubjects.length > 0 && (
                  <div className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/20 p-4">
                    <Target className="size-5 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Skip this if all subjects need equal attention. You can continue to review.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 5: Review */}
            {currentStep === "review" && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <Check className="size-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Ready to generate your plan?</h3>
                  <p className="text-muted-foreground">Review your choices and let AI do the magic</p>
                </div>

                {/* Summary Cards */}
                <div className="space-y-3">
                  {/* Exam Info */}
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15">
                        <CalendarDays className="size-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Exam Details</p>
                        <p className="text-lg font-semibold">{title || "Untitled Plan"}</p>
                        <p className="text-sm text-muted-foreground">
                          {examDate ? new Date(examDate).toLocaleDateString("en-US", { 
                            weekday: "long", 
                            month: "long", 
                            day: "numeric", 
                            year: "numeric" 
                          }) : "No date set"}
                          {daysUntilExam > 0 && ` • ${daysUntilExam} days away`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Study Hours */}
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15">
                        <Clock className="size-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Daily Commitment</p>
                        <p className="text-lg font-semibold">{dailyStudyHours} {dailyStudyHours === 1 ? "hour" : "hours"} per day</p>
                        <p className="text-sm text-muted-foreground">
                          {estimatedStudyHours} total study hours
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Syllabi */}
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15">
                        <BookOpen className="size-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-1">Syllabi</p>
                        <p className="text-lg font-semibold">
                          {selectedSyllabusIds.length} {selectedSyllabusIds.length === 1 ? "syllabus" : "syllabi"} selected
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {syllabi
                            .filter((s) => selectedSyllabusIds.includes(s.syllabusId))
                            .map((s) => (
                              <span
                                key={s.syllabusId}
                                className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                              >
                                {s.title}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weak Subjects */}
                  {weakSubjectIds.length > 0 && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/15">
                          <Flame className="size-5 text-amber-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Extra Focus</p>
                          <p className="text-lg font-semibold">
                            {weakSubjectIds.length} {weakSubjectIds.length === 1 ? "subject" : "subjects"} prioritized
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {selectedSubjects
                              .filter((s) => weakSubjectIds.includes(s.subjectId))
                              .map((s) => (
                                <span
                                  key={s.subjectId}
                                  className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-500"
                                >
                                  <Flame className="size-2.5" />
                                  {s.subjectName}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Preview */}
                <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
                      <Sparkles className="size-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg mb-2">AI is ready to generate:</p>
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <Check className="size-4 text-primary shrink-0" />
                          <span>Personalized daily study schedule</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="size-4 text-primary shrink-0" />
                          <span>Spaced repetition for {weakSubjectIds.length > 0 ? "weak subjects" : "all topics"}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="size-4 text-primary shrink-0" />
                          <span>Automatic revision sessions</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="size-4 text-primary shrink-0" />
                          <span>Progress tracking and recovery plans</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-border/60 bg-muted/30 px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              disabled={currentStepIndex === 0 || generating}
              className="gap-2"
            >
              <ChevronLeft className="size-4" />
              Back
            </Button>

            {/* Next/Submit Button */}
            {currentStep === "review" ? (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={generating || !canGoNext()}
                size="lg"
                className="gap-2 min-w-[200px]"
              >
                {generating ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-5" />
                    Generate My Study Plan
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={goNext}
                disabled={!canGoNext()}
                size="lg"
                className="gap-2 min-w-[120px]"
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

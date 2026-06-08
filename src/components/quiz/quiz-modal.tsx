"use client";

import { useState, useEffect } from "react";
import { X, Clock, CheckCircle2, AlertCircle, Trophy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Quiz, QuizQuestion, QuizResult } from "@/types/quiz";

interface QuizModalProps {
  taskId: string;
  taskTitle: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function QuizModal({ taskId, taskTitle, onComplete, onCancel }: QuizModalProps) {
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate quiz on mount
  useEffect(() => {
    generateQuiz();
  }, [taskId]);

  // Timer
  useEffect(() => {
    if (!quiz || result || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [quiz, result, timeRemaining]);

  async function generateQuiz() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate quiz");
      }

      const data = await response.json();
      setQuiz(data.data.quiz);
      setTimeRemaining(data.data.quiz.timeLimit);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!quiz) return;

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.quizId,
          answers,
          timeSpent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requireRetry) {
          setError(data.error);
          setTimeout(() => {
            generateQuiz();
          }, 3000);
          return;
        }
        throw new Error(data.error || "Failed to submit quiz");
      }

      setResult(data.data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  }

  function handleAutoSubmit() {
    handleSubmit();
  }

  function handleAnswerSelect(answer: string) {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: answer }));
  }

  function handleNext() {
    if (currentQuestion < (quiz?.questionCount || 0) - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  }

  function handlePrevious() {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = quiz ? ((currentQuestion + 1) / quiz.questionCount) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-card p-8">
          <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Generating quiz...</p>
        </div>
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="max-w-md rounded-2xl border border-destructive/20 bg-card p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="size-12 text-destructive" />
            <h3 className="text-lg font-semibold">Quiz Generation Failed</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
            <div className="flex gap-2">
              <Button onClick={generateQuiz} variant="outline">
                <RotateCcw className="size-4" />
                Retry
              </Button>
              <Button onClick={onCancel} variant="ghost">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-border/60 bg-card">
          {/* Header */}
          <div className={cn(
            "border-b border-border/60 p-6",
            result.status === "mastered" ? "bg-gradient-to-r from-emerald-500/10 to-transparent" :
            result.status === "completed" ? "bg-gradient-to-r from-primary/10 to-transparent" :
            result.status === "revision_required" ? "bg-gradient-to-r from-amber-500/10 to-transparent" :
            "bg-gradient-to-r from-destructive/10 to-transparent"
          )}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {result.status === "mastered" ? (
                  <Trophy className="size-8 text-emerald-500" />
                ) : result.status === "completed" ? (
                  <CheckCircle2 className="size-8 text-primary" />
                ) : result.status === "revision_required" ? (
                  <RotateCcw className="size-8 text-amber-500" />
                ) : (
                  <AlertCircle className="size-8 text-destructive" />
                )}
                <div>
                  <h2 className="text-xl font-bold">
                    {result.status === "mastered" ? "Mastered!" :
                     result.status === "completed" ? "Completed!" :
                     result.status === "revision_required" ? "Needs Review" :
                     "Needs More Study"}
                  </h2>
                  <p className="text-sm text-muted-foreground">{taskTitle}</p>
                </div>
              </div>
              <button onClick={() => { setResult(null); onComplete(); }} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Score */}
          <div className="p-6 border-b border-border/60">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold tabular-nums text-primary">{result.percentage}%</p>
                <p className="text-xs text-muted-foreground mt-1">Score</p>
              </div>
              <div>
                <p className="text-3xl font-bold tabular-nums text-emerald-500">{result.correctAnswers}</p>
                <p className="text-xs text-muted-foreground mt-1">Correct</p>
              </div>
              <div>
                <p className="text-3xl font-bold tabular-nums text-destructive">{result.incorrectAnswers}</p>
                <p className="text-xs text-muted-foreground mt-1">Incorrect</p>
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="p-6 space-y-4">
            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
              <p className="text-sm font-medium mb-2">Feedback</p>
              <p className="text-sm text-muted-foreground">{result.feedback}</p>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-medium mb-2">Next Step</p>
              <p className="text-sm text-muted-foreground">{result.nextAction}</p>
            </div>

            {/* Review answers */}
            <div className="space-y-3">
              <p className="text-sm font-semibold">Review Your Answers</p>
              {result.questions.map((q, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "rounded-lg border p-3",
                    q.isCorrect ? "border-emerald-500/20 bg-emerald-500/5" : "border-destructive/20 bg-destructive/5"
                  )}
                >
                  <p className="text-sm font-medium mb-2">
                    Q{idx + 1}: {q.questionText}
                  </p>
                  <div className="space-y-1 text-xs">
                    <p className={cn("font-medium", q.isCorrect ? "text-emerald-500" : "text-destructive")}>
                      Your answer: {q.userAnswer}
                    </p>
                    {!q.isCorrect && (
                      <p className="text-emerald-500 font-medium">
                        Correct answer: {q.correctAnswer}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={() => { setResult(null); onComplete(); }} className="w-full">
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const question = quiz.questions[currentQuestion];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="max-w-3xl w-full max-h-[90vh] overflow-hidden rounded-2xl border border-border/60 bg-card flex flex-col">
        {/* Header */}
        <div className="border-b border-border/60 p-6 bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">{taskTitle}</h2>
              <p className="text-sm text-muted-foreground mt-1">{quiz.subjectName}</p>
            </div>
            <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
              <X className="size-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Question {currentQuestion + 1} of {quiz.questionCount}
              </span>
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                <span className={cn(
                  "font-mono font-bold",
                  timeRemaining < 60 ? "text-destructive" : "text-foreground"
                )}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-border/40">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="rounded-xl border border-border/60 bg-muted/30 p-6">
              <p className="text-lg font-medium leading-relaxed">{question.questionText}</p>
            </div>

            <div className="space-y-3">
              {question.options.map((option, idx) => {
                const isSelected = answers[currentQuestion] === option;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(option)}
                    className={cn(
                      "w-full rounded-xl border-2 p-4 text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border/60 hover:border-primary/50 hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-border/60"
                        )}
                      >
                        {isSelected && <div className="size-2 rounded-full bg-white" />}
                      </div>
                      <p className="text-sm font-medium">{option}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/60 p-6 bg-muted/30">
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              variant="outline"
            >
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              {answeredCount} / {quiz.questionCount} answered
            </div>

            {currentQuestion < quiz.questionCount - 1 ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting || answeredCount < quiz.questionCount}
              >
                {submitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

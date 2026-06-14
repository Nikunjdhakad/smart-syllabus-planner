"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  FileImage,
  FileText,
  Loader2,
  MoreVertical,
  PenLine,
  Sparkles,
  Star,
  Clock,
  Target,
  TrendingUp,
  Brain,
  CheckCircle2,
  Eye,
  Trash2,
  CalendarPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type {
  ExtractionStatus,
  SubjectItem,
  SyllabusItem,
} from "@/types/syllabus";

async function readApiError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return typeof body.error === "string" ? body.error : "Request failed";
  } catch {
    return "Request failed";
  }
}

type UploadMethod = "pdf" | "image" | "manual" | null;

interface QuickStats {
  totalSyllabi: number;
  subjectsExtracted: number;
  topicsExtracted: number;
  studyHoursEstimated: number;
}

interface AIInsights {
  largestSubject: string;
  hardestSubject: string;
  totalTopics: number;
  estimatedCompletionTime: string;
  mostImportantTopic: string;
}

export function SyllabusIntelligenceCenter() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<UploadMethod>(null);
  const [syllabi, setSyllabi] = useState<SyllabusItem[]>([]);
  const [subjectsBySyllabus, setSubjectsBySyllabus] = useState<Record<string, SubjectItem[]>>({});
  const [expandedSyllabusId, setExpandedSyllabusId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ syllabusId: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const loadSyllabi = useCallback(async () => {
    const response = await fetch("/api/syllabus");
    if (!response.ok) throw new Error(await readApiError(response));
    const body = await response.json();
    return body.data.syllabi as SyllabusItem[];
  }, []);

  const loadSubjects = useCallback(async (syllabusId: string) => {
    const response = await fetch(`/api/subjects?syllabusId=${encodeURIComponent(syllabusId)}`);
    if (!response.ok) throw new Error(await readApiError(response));
    const body = await response.json();
    return body.data.subjects as SubjectItem[];
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const list = await loadSyllabi();
        setSyllabi(list);
      } catch {
        // ignore
      }
      setLoading(false);
    })();
  }, [loadSyllabi]);

  // Poll for active extractions
  const hasActiveExtraction = syllabi.some(
    (s) => s.extractionStatus === "pending" || s.extractionStatus === "processing"
  );

  useEffect(() => {
    if (!hasActiveExtraction) return;
    const interval = setInterval(async () => {
      try {
        const list = await loadSyllabi();
        setSyllabi(list);
      } catch {
        // ignore
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [hasActiveExtraction, loadSyllabi]);

  // Load subjects when syllabus is expanded
  useEffect(() => {
    if (!expandedSyllabusId) return;
    const item = syllabi.find((s) => s.syllabusId === expandedSyllabusId);
    if (!item || item.extractionStatus !== "completed") return;

    void (async () => {
      try {
        const subjects = await loadSubjects(expandedSyllabusId);
        setSubjectsBySyllabus((prev) => ({ ...prev, [expandedSyllabusId]: subjects }));
      } catch {
        // ignore
      }
    })();
  }, [expandedSyllabusId, syllabi, loadSubjects]);

  // Compute quick stats
  const quickStats: QuickStats = {
    totalSyllabi: syllabi.length,
    subjectsExtracted: Object.values(subjectsBySyllabus).flat().length,
    topicsExtracted: Object.values(subjectsBySyllabus).flat().reduce((sum, s) => sum + s.topics.length, 0),
    studyHoursEstimated: Math.round(Object.values(subjectsBySyllabus).flat().reduce((sum, s) => sum + s.topics.length * 2, 0)),
  };

  // Compute AI insights
  const allSubjects = Object.values(subjectsBySyllabus).flat();
  const aiInsights: AIInsights | null = allSubjects.length > 0 ? {
    largestSubject: allSubjects.reduce((max, s) => s.topics.length > max.topics.length ? s : max, allSubjects[0]).subjectName,
    hardestSubject: allSubjects.reduce((max, s) => {
      const avgDiff = s.topics.reduce((sum, t) => sum + (t.difficulty ?? 3), 0) / s.topics.length;
      const maxAvgDiff = max.topics.reduce((sum, t) => sum + (t.difficulty ?? 3), 0) / max.topics.length;
      return avgDiff > maxAvgDiff ? s : max;
    }, allSubjects[0]).subjectName,
    totalTopics: allSubjects.reduce((sum, s) => sum + s.topics.length, 0),
    estimatedCompletionTime: `${Math.round(allSubjects.reduce((sum, s) => sum + s.topics.length * 2, 0) / 7)} weeks`,
    mostImportantTopic: allSubjects.flatMap(s => s.topics).reduce((max, t) => (t.difficulty ?? 3) > (max.difficulty ?? 3) ? t : max, allSubjects[0].topics[0])?.topicName ?? "N/A",
  } : null;

  async function handleManualSubmit() {
    if (!title.trim() || !rawContent.trim()) {
      setMessage({ type: "error", text: "Title and content are required" });
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/syllabus/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), rawContent }),
      });
      if (!response.ok) throw new Error(await readApiError(response));
      setTitle("");
      setRawContent("");
      setSelectedMethod(null);
      setMessage({ type: "success", text: "Syllabus saved. AI extraction started." });
      const list = await loadSyllabi();
      setSyllabi(list);
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Upload failed" });
    } finally {
      setUploading(false);
    }
  }

  async function handleFileSubmit(endpoint: string, file: File | null) {
    if (!file) {
      setMessage({ type: "error", text: "Please choose a file" });
      return;
    }
    if (!title.trim()) {
      setMessage({ type: "error", text: "Title is required" });
      return;
    }
    setUploading(true);
    setMessage(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title.trim());
    try {
      const response = await fetch(endpoint, { method: "POST", body: formData });
      if (!response.ok) throw new Error(await readApiError(response));
      setTitle("");
      setPdfFile(null);
      setImageFile(null);
      setSelectedMethod(null);
      setMessage({ type: "success", text: "File uploaded. AI extraction started." });
      const list = await loadSyllabi();
      setSyllabi(list);
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Upload failed" });
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteSyllabus(syllabusId: string) {
    setDeleting(true);
    try {
      const response = await fetch(`/api/syllabus/${encodeURIComponent(syllabusId)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(await readApiError(response));
      
      // Remove from local state
      setSyllabi((prev) => prev.filter((s) => s.syllabusId !== syllabusId));
      setSubjectsBySyllabus((prev) => {
        const updated = { ...prev };
        delete updated[syllabusId];
        return updated;
      });
      
      if (expandedSyllabusId === syllabusId) {
        setExpandedSyllabusId(null);
      }
      
      setMessage({ type: "success", text: "Syllabus deleted successfully" });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Delete failed" });
    } finally {
      setDeleting(false);
      setDeleteConfirmation(null);
    }
  }

  return (
    <div className="page-enter space-y-8">
      {/* SECTION 1: Hero Area */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-card p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="relative space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Syllabus Intelligence Center</h1>
            <p className="text-muted-foreground max-w-2xl">
              Transform raw syllabus documents into structured learning roadmaps
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur p-4">
              <div className="flex items-center gap-2 text-primary mb-1">
                <BookOpen className="size-5" />
                <span className="text-2xl font-bold">{quickStats.totalSyllabi}</span>
              </div>
              <p className="text-xs text-muted-foreground">Total Syllabi</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur p-4">
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <Target className="size-5" />
                <span className="text-2xl font-bold">{quickStats.subjectsExtracted}</span>
              </div>
              <p className="text-xs text-muted-foreground">Subjects Extracted</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur p-4">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <CheckCircle2 className="size-5" />
                <span className="text-2xl font-bold">{quickStats.topicsExtracted}</span>
              </div>
              <p className="text-xs text-muted-foreground">Topics Extracted</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur p-4">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Clock className="size-5" />
                <span className="text-2xl font-bold">{quickStats.studyHoursEstimated}</span>
              </div>
              <p className="text-xs text-muted-foreground">Study Hours Estimated</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Upload Experience */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Upload Your Syllabus</h2>
        
        {/* Upload Method Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <button
            onClick={() => setSelectedMethod(selectedMethod === "pdf" ? null : "pdf")}
            className={cn(
              "group relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all hover:border-primary/50",
              selectedMethod === "pdf"
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border/60 bg-card hover:bg-card/80"
            )}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={cn(
                "flex size-16 items-center justify-center rounded-2xl transition-colors",
                selectedMethod === "pdf" ? "bg-primary/15" : "bg-muted/50 group-hover:bg-primary/10"
              )}>
                <FileText className={cn("size-8", selectedMethod === "pdf" ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="text-center">
                <h3 className="font-semibold mb-1">PDF</h3>
                <p className="text-xs text-muted-foreground">Upload PDF document</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedMethod(selectedMethod === "image" ? null : "image")}
            className={cn(
              "group relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all hover:border-primary/50",
              selectedMethod === "image"
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border/60 bg-card hover:bg-card/80"
            )}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={cn(
                "flex size-16 items-center justify-center rounded-2xl transition-colors",
                selectedMethod === "image" ? "bg-primary/15" : "bg-muted/50 group-hover:bg-primary/10"
              )}>
                <FileImage className={cn("size-8", selectedMethod === "image" ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="text-center">
                <h3 className="font-semibold mb-1">Image</h3>
                <p className="text-xs text-muted-foreground">Upload image file</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedMethod(selectedMethod === "manual" ? null : "manual")}
            className={cn(
              "group relative overflow-hidden rounded-2xl border-2 p-6 text-left transition-all hover:border-primary/50",
              selectedMethod === "manual"
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border/60 bg-card hover:bg-card/80"
            )}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={cn(
                "flex size-16 items-center justify-center rounded-2xl transition-colors",
                selectedMethod === "manual" ? "bg-primary/15" : "bg-muted/50 group-hover:bg-primary/10"
              )}>
                <PenLine className={cn("size-8", selectedMethod === "manual" ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div className="text-center">
                <h3 className="font-semibold mb-1">Manual Entry</h3>
                <p className="text-xs text-muted-foreground">Paste syllabus text</p>
              </div>
            </div>
          </button>
        </div>

        {/* Upload Interface */}
        {selectedMethod && (
          <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="title-input" className="text-sm font-medium">Syllabus Title</label>
              <Input
                id="title-input"
                placeholder="e.g. CS101 — Fall 2024"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11"
              />
            </div>

            {selectedMethod === "manual" && (
              <div className="space-y-2">
                <label htmlFor="content-input" className="text-sm font-medium">Syllabus Content</label>
                <textarea
                  id="content-input"
                  rows={8}
                  placeholder="Paste your syllabus content here..."
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <Button onClick={handleManualSubmit} disabled={uploading} size="lg" className="w-full gap-2">
                  {uploading ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
                  {uploading ? "Processing..." : "Extract with AI"}
                </Button>
              </div>
            )}

            {selectedMethod === "pdf" && (
              <div className="space-y-2">
                <label htmlFor="pdf-input" className="text-sm font-medium">PDF File (max 10MB)</label>
                <Input
                  id="pdf-input"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                  className="h-11"
                />
                <Button onClick={() => handleFileSubmit("/api/syllabus/upload", pdfFile)} disabled={uploading} size="lg" className="w-full gap-2">
                  {uploading ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
                  {uploading ? "Uploading..." : "Upload & Extract"}
                </Button>
              </div>
            )}

            {selectedMethod === "image" && (
              <div className="space-y-2">
                <label htmlFor="image-input" className="text-sm font-medium">Image File (max 10MB)</label>
                <Input
                  id="image-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  className="h-11"
                />
                <Button onClick={() => handleFileSubmit("/api/syllabus/upload-image", imageFile)} disabled={uploading} size="lg" className="w-full gap-2">
                  {uploading ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
                  {uploading ? "Uploading..." : "Upload & Extract"}
                </Button>
              </div>
            )}

            {message && (
              <div role="alert" className={cn("rounded-xl border px-4 py-3 text-sm",
                message.type === "success" ? "border-emerald-500/25 bg-emerald-500/8 text-emerald-400" : "border-destructive/25 bg-destructive/8 text-destructive"
              )}>
                {message.text}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 3: AI Processing Experience */}
      {hasActiveExtraction && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Loader2 className="size-5 animate-spin text-primary" />
            <h3 className="font-semibold">AI Processing in Progress</h3>
          </div>
          <div className="flex items-center justify-between gap-2">
            {["Upload", "Analysis", "Subject Extraction", "Topic Mapping", "Completion"].map((stage, idx) => (
              <div key={stage} className="flex-1 text-center">
                <div className={cn(
                  "mx-auto mb-2 size-10 rounded-full border-2 flex items-center justify-center transition-all",
                  idx < 2 ? "border-primary bg-primary/15 text-primary" : "border-border/60 bg-muted/30 text-muted-foreground"
                )}>
                  {idx < 2 ? <CheckCircle2 className="size-5" /> : <div className="size-2 rounded-full bg-current" />}
                </div>
                <p className="text-xs font-medium">{stage}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: AI Insights */}
      {aiInsights && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="size-5 text-primary" />
            <h2 className="text-xl font-semibold">AI Intelligence Insights</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-card p-5 space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="size-5" />
                <span className="text-sm font-medium text-muted-foreground">Largest Subject</span>
              </div>
              <p className="text-lg font-semibold">{aiInsights.largestSubject}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-5 space-y-2">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="size-5" />
                <span className="text-sm font-medium text-muted-foreground">Hardest Subject</span>
              </div>
              <p className="text-lg font-semibold">{aiInsights.hardestSubject}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="size-5" />
                <span className="text-sm font-medium text-muted-foreground">Total Topics</span>
              </div>
              <p className="text-lg font-semibold">{aiInsights.totalTopics}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-5 space-y-2">
              <div className="flex items-center gap-2 text-amber-400">
                <Clock className="size-5" />
                <span className="text-sm font-medium text-muted-foreground">Estimated Completion</span>
              </div>
              <p className="text-lg font-semibold">{aiInsights.estimatedCompletionTime}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-5 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400">
                <Star className="size-5" />
                <span className="text-sm font-medium text-muted-foreground">Most Important Topic</span>
              </div>
              <p className="text-lg font-semibold">{aiInsights.mostImportantTopic}</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: Recent Syllabi */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Syllabi</h2>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-32 rounded-xl" />
            ))}
          </div>
        ) : syllabi.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 py-12 text-center">
            <BookOpen className="size-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-sm font-medium mb-1">No syllabi yet</p>
            <p className="text-xs text-muted-foreground">Upload your first syllabus above to get started</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {syllabi.map((item) => {
              const subjects = subjectsBySyllabus[item.syllabusId] ?? [];
              const topicCount = subjects.reduce((sum, s) => sum + s.topics.length, 0);
              const expanded = expandedSyllabusId === item.syllabusId;

              return (
                <div key={item.syllabusId} className="rounded-xl border border-border/60 bg-card overflow-hidden">
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        onClick={() => setExpandedSyllabusId(expanded ? null : item.syllabusId)}
                        className="flex-1 text-left"
                      >
                        <h3 className="font-semibold line-clamp-1 hover:text-primary transition-colors">{item.title}</h3>
                      </button>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setExpandedSyllabusId(expanded ? null : item.syllabusId)}
                          className="p-1.5 hover:bg-muted/50 rounded-lg transition-colors"
                        >
                          <ChevronDown className={cn("size-5 text-muted-foreground transition-transform", expanded && "rotate-180")} />
                        </button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1.5 hover:bg-muted/50 rounded-lg transition-colors">
                            <MoreVertical className="size-5 text-muted-foreground" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => setExpandedSyllabusId(expanded ? null : item.syllabusId)}
                            >
                              <Eye className="size-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push("/planner")}
                              disabled={item.extractionStatus !== "completed"}
                            >
                              <CalendarPlus className="size-4" />
                              Generate Study Plan
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleteConfirmation({ syllabusId: item.syllabusId, title: item.title })}
                            >
                              <Trash2 className="size-4" />
                              Delete Syllabus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={item.extractionStatus === "completed" ? "outline" : item.extractionStatus === "failed" ? "destructive" : "default"}>
                        {item.extractionStatus}
                      </Badge>
                      <Badge variant="secondary">{item.sourceType}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Subjects</p>
                        <p className="text-lg font-semibold">{subjects.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Topics</p>
                        <p className="text-lg font-semibold">{topicCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="text-xs font-medium">{new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 6: Subject Explorer */}
                  {expanded && item.extractionStatus === "completed" && (
                    <div className="border-t border-border/60 p-5 space-y-3 bg-muted/20">
                      {subjects.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No subjects found</p>
                      ) : (
                        subjects.map((subject) => (
                          <div key={subject.subjectId} className="rounded-lg border border-border/60 bg-card p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{subject.subjectName}</h4>
                            </div>
                            <div className="grid grid-cols-3 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground">Topics</p>
                                <p className="font-medium">{subject.topics.length}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Difficulty</p>
                                <div className="flex gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={cn("size-3", i < 3 ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30")} />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Study Time</p>
                                <p className="font-medium">{subject.topics.length * 2}h</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 7: Next Action CTA */}
      {syllabi.some((s) => s.extractionStatus === "completed") && (
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-card p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Ready to Start Learning?</h3>
          <p className="text-muted-foreground mb-6">
            Your syllabus has been analyzed. Generate a personalized study plan now.
          </p>
          <Button onClick={() => router.push("/planner")} size="lg" className="gap-2">
            <Sparkles className="size-5" />
            Generate Study Plan
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-2">Delete Syllabus?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This will permanently delete:
            </p>
            <ul className="text-sm text-muted-foreground mb-4 space-y-1 pl-5 list-disc">
              <li>Syllabus: <span className="font-medium text-foreground">{deleteConfirmation.title}</span></li>
              <li>All subjects associated with this syllabus</li>
              <li>All topics associated with this syllabus</li>
            </ul>
            <p className="text-sm font-medium text-destructive mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmation(null)}
                disabled={deleting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteSyllabus(deleteConfirmation.syllabusId)}
                disabled={deleting}
                className="flex-1 gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

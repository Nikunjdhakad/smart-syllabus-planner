import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Quiz from "@/models/Quiz";
import type { QuizAnalytics } from "@/types/quiz";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get all completed quizzes
    const quizzes = await Quiz.find({
      userId: session.userId,
      status: { $in: ["mastered", "completed", "revision_required", "restudy_required"] },
    })
      .sort({ completedAt: -1 })
      .lean();

    if (quizzes.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          analytics: {
            totalQuizzes: 0,
            averageScore: 0,
            masteredTopics: 0,
            weakTopics: [],
            strongTopics: [],
            knowledgeAccuracy: 0,
            subjectPerformance: [],
            recentTrend: [],
          } as QuizAnalytics,
        },
      });
    }

    // Calculate analytics
    const totalQuizzes = quizzes.length;
    const averageScore = quizzes.reduce((sum, q) => sum + q.percentage, 0) / totalQuizzes;
    const masteredTopics = quizzes.filter((q) => q.status === "mastered").length;

    // Identify weak topics (< 70%)
    const weakTopics = quizzes
      .filter((q) => q.percentage < 70)
      .map((q) => q.topicName)
      .slice(0, 5);

    // Identify strong topics (>= 95%)
    const strongTopics = quizzes
      .filter((q) => q.percentage >= 95)
      .map((q) => q.topicName)
      .slice(0, 5);

    // Calculate knowledge accuracy (overall mastery)
    const knowledgeAccuracy = Math.round(averageScore);

    // Subject performance
    const subjectMap = new Map<string, { name: string; scores: number[]; count: number }>();
    quizzes.forEach((q) => {
      if (!subjectMap.has(q.subjectId)) {
        subjectMap.set(q.subjectId, {
          name: q.subjectName,
          scores: [],
          count: 0,
        });
      }
      const subject = subjectMap.get(q.subjectId)!;
      subject.scores.push(q.percentage);
      subject.count++;
    });

    const subjectPerformance = Array.from(subjectMap.entries()).map(([subjectId, data]) => ({
      subjectId,
      subjectName: data.name,
      averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.count),
      quizzesTaken: data.count,
    }));

    // Recent trend (last 10 quizzes)
    const recentTrend = quizzes
      .slice(0, 10)
      .reverse()
      .map((q) => ({
        date: q.completedAt?.toISOString() || q.createdAt.toISOString(),
        score: q.percentage,
      }));

    const analytics: QuizAnalytics = {
      totalQuizzes,
      averageScore: Math.round(averageScore),
      masteredTopics,
      weakTopics,
      strongTopics,
      knowledgeAccuracy,
      subjectPerformance,
      recentTrend,
    };

    return NextResponse.json({
      success: true,
      data: { analytics },
    });
  } catch (error) {
    console.error("Quiz analytics error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}

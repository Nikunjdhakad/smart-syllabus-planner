import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Quiz from "@/models/Quiz";
import Task from "@/models/Task";
import Topic from "@/models/Topic";
import Subject from "@/models/Subject";
import { calculateQuizParams, determineDifficulty, generateQuestions } from "@/lib/quiz/generator";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { taskId, difficulty } = body;

    if (!taskId) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    // Get task details
    const task = await Task.findOne({ taskId, userId: session.userId }).lean();
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Get topic and subject details
    const [topic, subject] = await Promise.all([
      Topic.findOne({ topicId: task.topicId }).lean(),
      Subject.findOne({ subjectId: task.subjectId }).lean(),
    ]);

    if (!topic || !subject) {
      return NextResponse.json({ error: "Topic or subject not found" }, { status: 404 });
    }

    // Determine difficulty and calculate params
    const quizDifficulty = difficulty || determineDifficulty({
      topicName: task.taskTitle,
      syllabusContent: topic.description,
    });

    const { questionCount, timeLimit } = calculateQuizParams(quizDifficulty);

    // Generate questions using AI
    const questions = await generateQuestions({
      topicName: task.taskTitle,
      subjectName: subject.subjectName,
      syllabusContent: topic.description,
      topicDescription: topic.description,
      questionCount,
    });

    // Create quiz record
    const quiz = await Quiz.create({
      userId: session.userId,
      taskId: task.taskId,
      topicId: task.topicId,
      subjectId: task.subjectId,
      topicName: task.taskTitle,
      subjectName: subject.subjectName,
      questionCount,
      timeLimit,
      questions,
      status: "in_progress",
    });

    return NextResponse.json({
      success: true,
      data: {
        quiz: {
          quizId: quiz.quizId,
          topicName: quiz.topicName,
          subjectName: quiz.subjectName,
          questionCount: quiz.questionCount,
          timeLimit: quiz.timeLimit,
          questions: quiz.questions.map((q) => ({
            questionText: q.questionText,
            options: q.options,
          })),
          startedAt: quiz.startedAt,
        },
      },
    });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate quiz" },
      { status: 500 },
    );
  }
}

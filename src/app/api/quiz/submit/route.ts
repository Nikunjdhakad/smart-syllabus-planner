import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Quiz from "@/models/Quiz";
import Task from "@/models/Task";
import Revision from "@/models/Revision";
import { calculateScore, validateQuizAttempt, generateFeedback } from "@/lib/quiz/generator";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { quizId, answers, timeSpent } = body;

    if (!quizId || !answers) {
      return NextResponse.json({ error: "Quiz ID and answers required" }, { status: 400 });
    }

    // Get quiz
    const quiz = await Quiz.findOne({ quizId, userId: session.userId });
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (quiz.status !== "in_progress") {
      return NextResponse.json({ error: "Quiz already completed" }, { status: 400 });
    }

    // Validate attempt
    const validation = validateQuizAttempt({
      questionCount: quiz.questionCount,
      timeLimit: quiz.timeLimit,
      timeSpent,
      answers,
    });

    if (!validation.isValid) {
      quiz.status = "abandoned";
      quiz.isValid = false;
      await quiz.save();

      return NextResponse.json(
        {
          error: validation.reason,
          requireRetry: true,
        },
        { status: 400 },
      );
    }

    // Calculate score
    let correctCount = 0;
    const questionsWithAnswers = quiz.questions.map((q, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;

      return {
        ...q.toObject(),
        userAnswer,
        isCorrect,
      };
    });

    const { score, percentage, status } = calculateScore(correctCount, quiz.questionCount);

    // Update quiz
    quiz.questions = questionsWithAnswers as any;
    quiz.answers = new Map(Object.entries(answers));
    quiz.score = score;
    quiz.percentage = percentage;
    quiz.status = status;
    quiz.completedAt = new Date();
    quiz.timeSpent = timeSpent;
    await quiz.save();

    // Update task based on status
    const task = await Task.findOne({ taskId: quiz.taskId });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (status === "mastered" || status === "completed" || status === "revision_required") {
      // Mark task as completed
      task.status = "completed";
      task.completedAt = new Date();
      await task.save();

      // If revision required, schedule extra revision
      if (status === "revision_required") {
        const existingRevisions = await Revision.countDocuments({
          userId: session.userId,
          topicId: quiz.topicId,
        });

        // Add one extra revision
        await Revision.create({
          userId: session.userId,
          topicId: quiz.topicId,
          subjectId: quiz.subjectId,
          revisionNumber: existingRevisions + 1,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          status: "scheduled",
        });
      }
    } else {
      // restudy_required - task remains incomplete
      task.status = "pending";
      await task.save();
    }

    // Generate feedback
    const { feedback, nextAction } = generateFeedback({
      percentage,
      status,
      topicName: quiz.topicName,
      incorrectCount: quiz.questionCount - correctCount,
    });

    return NextResponse.json({
      success: true,
      data: {
        result: {
          quizId: quiz.quizId,
          score: quiz.score,
          percentage: quiz.percentage,
          status: quiz.status,
          correctAnswers: correctCount,
          incorrectAnswers: quiz.questionCount - correctCount,
          feedback,
          nextAction,
          questions: questionsWithAnswers.map((q) => ({
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            userAnswer: q.userAnswer,
            isCorrect: q.isCorrect,
          })),
        },
      },
    });
  } catch (error) {
    console.error("Quiz submission error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to submit quiz" },
      { status: 500 },
    );
  }
}

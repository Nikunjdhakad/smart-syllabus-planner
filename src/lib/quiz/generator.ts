import type { QuizDifficulty, QuizQuestion } from "@/types/quiz";

/**
 * Calculate quiz parameters based on topic complexity
 */
export function calculateQuizParams(difficulty: QuizDifficulty = "medium"): {
  questionCount: number;
  timeLimit: number;
} {
  const params = {
    very_small: { questionCount: 3, timeLimit: 120 }, // 2 minutes
    small: { questionCount: 5, timeLimit: 300 }, // 5 minutes
    medium: { questionCount: 8, timeLimit: 480 }, // 8 minutes
    large: { questionCount: 12, timeLimit: 720 }, // 12 minutes
    very_large: { questionCount: 15, timeLimit: 900 }, // 15 minutes
  };

  return params[difficulty];
}

/**
 * Determine difficulty based on topic characteristics
 */
export function determineDifficulty(params: {
  topicName: string;
  syllabusContent?: string;
  estimatedDuration?: number;
}): QuizDifficulty {
  const { topicName, syllabusContent, estimatedDuration } = params;

  // Count concepts/keywords
  const conceptCount = (syllabusContent || topicName).split(/[,;.\n]/).filter((s) => s.trim().length > 3).length;

  // Estimate based on duration (in hours)
  if (estimatedDuration) {
    if (estimatedDuration < 1) return "very_small";
    if (estimatedDuration < 2) return "small";
    if (estimatedDuration < 4) return "medium";
    if (estimatedDuration < 6) return "large";
    return "very_large";
  }

  // Estimate based on concept count
  if (conceptCount < 3) return "very_small";
  if (conceptCount < 6) return "small";
  if (conceptCount < 10) return "medium";
  if (conceptCount < 15) return "large";
  return "very_large";
}

/**
 * Generate quiz questions using AI (Groq)
 */
export async function generateQuestions(params: {
  topicName: string;
  subjectName: string;
  syllabusContent?: string;
  topicDescription?: string;
  questionCount: number;
}): Promise<QuizQuestion[]> {
  const { topicName, subjectName, syllabusContent, topicDescription, questionCount } = params;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const prompt = `You are an expert educational assessment designer. Generate exactly ${questionCount} high-quality multiple-choice questions to test understanding of the following topic:

Subject: ${subjectName}
Topic: ${topicName}
${topicDescription ? `Description: ${topicDescription}` : ""}
${syllabusContent ? `Syllabus Content: ${syllabusContent}` : ""}

Requirements:
- Generate EXACTLY ${questionCount} questions
- Each question must test UNDERSTANDING, not just memorization
- Include scenario-based and conceptual questions
- Mix difficulty levels: easy, medium, hard
- Each question must have 4 options (A, B, C, D)
- Clearly indicate the correct answer
- Questions must be relevant to "${topicName}" in "${subjectName}"
- Avoid trivial or ambiguous questions

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "questions": [
    {
      "questionText": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A"
    }
  ]
}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are an expert educational assessment designer. You generate high-quality quiz questions that test understanding, application, and reasoning.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in Groq API response");
    }

    // Parse JSON response
    const parsed = JSON.parse(content);
    const questions = parsed.questions;

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid questions format from AI");
    }

    // Validate and normalize questions
    return questions.slice(0, questionCount).map((q: any) => ({
      questionText: q.questionText,
      options: q.options.slice(0, 4),
      correctAnswer: q.correctAnswer,
      userAnswer: null,
      isCorrect: null,
      timeSpent: 0,
    }));
  } catch (error) {
    console.error("Quiz generation error:", error);
    // Fallback to generic questions if AI fails
    return generateFallbackQuestions(topicName, subjectName, questionCount);
  }
}

/**
 * Fallback questions if AI generation fails
 */
function generateFallbackQuestions(
  topicName: string,
  subjectName: string,
  count: number,
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  for (let i = 0; i < count; i++) {
    questions.push({
      questionText: `What is a key concept in ${topicName}?`,
      options: [
        "Option A - requires manual configuration",
        "Option B - requires manual configuration",
        "Option C - requires manual configuration",
        "Option D - requires manual configuration",
      ],
      correctAnswer: "Option A - requires manual configuration",
      userAnswer: null,
      isCorrect: null,
      timeSpent: 0,
    });
  }

  return questions;
}

/**
 * Calculate quiz score and status
 */
export function calculateScore(
  correctAnswers: number,
  totalQuestions: number,
): { score: number; percentage: number; status: "mastered" | "completed" | "revision_required" | "restudy_required" } {
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  let status: "mastered" | "completed" | "revision_required" | "restudy_required";
  if (percentage >= 95) {
    status = "mastered";
  } else if (percentage >= 80) {
    status = "completed";
  } else if (percentage >= 60) {
    status = "revision_required";
  } else {
    status = "restudy_required";
  }

  return { score: correctAnswers, percentage, status };
}

/**
 * Validate quiz attempt (anti-cheat)
 */
export function validateQuizAttempt(params: {
  questionCount: number;
  timeLimit: number;
  timeSpent: number;
  answers: Record<number, string>;
}): { isValid: boolean; reason?: string } {
  const { questionCount, timeLimit, timeSpent, answers } = params;

  // Check if submitted too fast (less than 5 seconds per question)
  const minTime = questionCount * 5;
  if (timeSpent < minTime) {
    return {
      isValid: false,
      reason: "Submission too fast. Please take time to read the questions carefully.",
    };
  }

  // Check if time exceeded
  if (timeSpent > timeLimit + 10) {
    return {
      isValid: false,
      reason: "Time limit exceeded.",
    };
  }

  // Check if all questions answered
  if (Object.keys(answers).length !== questionCount) {
    return {
      isValid: false,
      reason: "Not all questions were answered.",
    };
  }

  return { isValid: true };
}

/**
 * Generate AI feedback based on performance
 */
export function generateFeedback(params: {
  percentage: number;
  status: string;
  topicName: string;
  incorrectCount: number;
}): { feedback: string; nextAction: string } {
  const { percentage, status, topicName, incorrectCount } = params;

  let feedback = "";
  let nextAction = "";

  if (status === "mastered") {
    feedback = `Excellent work! You've demonstrated mastery of ${topicName} with ${percentage}% accuracy. Your understanding of the concepts is solid.`;
    nextAction = "Continue to the next topic. This topic is marked as completed.";
  } else if (status === "completed") {
    feedback = `Great job! You've completed ${topicName} with ${percentage}% accuracy. You have a good grasp of the material.`;
    nextAction = "Task completed. Regular revision scheduled automatically.";
  } else if (status === "revision_required") {
    feedback = `You scored ${percentage}% on ${topicName}. You understand the basics but need more practice. ${incorrectCount} questions were answered incorrectly.`;
    nextAction = "Task completed, but an extra revision session has been scheduled to strengthen your understanding.";
  } else {
    feedback = `You scored ${percentage}% on ${topicName}. This indicates you need to review the material more thoroughly. ${incorrectCount} questions were incorrect.`;
    nextAction = "Task not completed. Please study this topic again and retry the quiz.";
  }

  return { feedback, nextAction };
}

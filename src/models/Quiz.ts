import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const quizQuestionSchema = new Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  userAnswer: { type: String, default: null },
  isCorrect: { type: Boolean, default: null },
  timeSpent: { type: Number, default: 0 }, // seconds
});

const quizSchema = new Schema(
  {
    quizId: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomUUID(),
    },
    userId: { type: String, required: true, index: true },
    taskId: { type: String, required: true, index: true },
    topicId: { type: String, required: true, index: true },
    subjectId: { type: String, required: true, index: true },
    topicName: { type: String, required: true },
    subjectName: { type: String, required: true },
    questionCount: { type: Number, required: true },
    timeLimit: { type: Number, required: true }, // seconds
    questions: [quizQuestionSchema],
    answers: { type: Map, of: String, default: {} }, // questionIndex -> answer
    score: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["mastered", "completed", "revision_required", "restudy_required", "in_progress", "abandoned"],
      default: "in_progress",
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    timeSpent: { type: Number, default: 0 }, // total seconds spent
    isValid: { type: Boolean, default: true }, // anti-cheat flag
  },
  { timestamps: true },
);

quizSchema.index({ userId: 1, status: 1 });
quizSchema.index({ userId: 1, topicId: 1 });
quizSchema.index({ userId: 1, subjectId: 1 });
quizSchema.index({ userId: 1, completedAt: 1 });

export type QuizDocument = InferSchemaType<typeof quizSchema>;
export type QuizQuestionDocument = InferSchemaType<typeof quizQuestionSchema>;

const Quiz: Model<QuizDocument> =
  mongoose.models.Quiz ?? mongoose.model("Quiz", quizSchema);

export default Quiz;

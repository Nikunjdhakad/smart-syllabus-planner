import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const studyPlanSchema = new Schema(
  {
    planId: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomUUID(),
    },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    examDate: { type: Date },
    dailyStudyHours: { type: Number, min: 0.5, max: 24, default: 2 },
    weakSubjects: [{ type: String }],
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
    },
  },
  { timestamps: true },
);

export type StudyPlanDocument = InferSchemaType<typeof studyPlanSchema>;

const StudyPlan: Model<StudyPlanDocument> =
  mongoose.models.StudyPlan ?? mongoose.model("StudyPlan", studyPlanSchema);

export default StudyPlan;

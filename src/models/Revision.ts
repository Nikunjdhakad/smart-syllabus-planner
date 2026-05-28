import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const revisionSchema = new Schema(
  {
    revisionId: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomUUID(),
    },
    userId: { type: String, required: true, index: true },
    topicId: { type: String, required: true, index: true },
    subjectId: { type: String, index: true },
    scheduledDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "completed", "skipped"],
      default: "scheduled",
    },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

export type RevisionDocument = InferSchemaType<typeof revisionSchema>;

const Revision: Model<RevisionDocument> =
  mongoose.models.Revision ?? mongoose.model("Revision", revisionSchema);

export default Revision;

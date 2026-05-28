import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

import { TOPIC_STATUS } from "@/lib/constants";

const topicSchema = new Schema(
  {
    topicId: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomUUID(),
    },
    subjectId: { type: String, required: true, index: true },
    topicName: { type: String, required: true, trim: true },
    difficulty: { type: Number, min: 1, max: 5, default: 3 },
    status: {
      type: String,
      enum: TOPIC_STATUS,
      default: "pending",
    },
  },
  { timestamps: true },
);

export type TopicDocument = InferSchemaType<typeof topicSchema>;

const Topic: Model<TopicDocument> =
  mongoose.models.Topic ?? mongoose.model("Topic", topicSchema);

export default Topic;

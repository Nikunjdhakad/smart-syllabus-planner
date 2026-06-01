import { z } from "zod";

export const createSubjectSchema = z.object({
  syllabusId: z.string().min(1, "Syllabus ID is required").trim(),
  subjectName: z.string().min(1, "Subject name is required").max(200).trim(),
});

export const createTopicSchema = z.object({
  subjectId: z.string().min(1, "Subject ID is required").trim(),
  topicName: z.string().min(1, "Topic name is required").max(200).trim(),
  difficulty: z.number().int().min(1).max(5).optional().default(3),
});

export const updateTopicSchema = z.object({
  topicName: z.string().min(1).max(200).trim().optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
});

import type { TASK_STATUS, TOPIC_STATUS, SYLLABUS_SOURCE } from "@/lib/constants";

export type TaskStatus = (typeof TASK_STATUS)[number];
export type TopicStatus = (typeof TOPIC_STATUS)[number];
export type SyllabusSource = (typeof SYLLABUS_SOURCE)[number];

export type ApiError = {
  error: string;
  details?: unknown;
};

export type ApiSuccess<T> = {
  data: T;
};

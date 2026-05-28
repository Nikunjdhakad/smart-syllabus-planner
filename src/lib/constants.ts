export const APP_NAME = "Smart Syllabus Planner";

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  syllabus: "/syllabus",
  planner: "/planner",
  progress: "/progress",
  revisions: "/revisions",
  assistant: "/assistant",
} as const;

export const SESSION_COOKIE = "ssp_session";

export const TASK_STATUS = ["pending", "in_progress", "completed", "missed"] as const;
export const TOPIC_STATUS = ["pending", "in_progress", "completed"] as const;
export const SYLLABUS_SOURCE = ["pdf", "image", "manual"] as const;

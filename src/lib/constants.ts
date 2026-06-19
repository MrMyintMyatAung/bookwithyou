import type { SessionStatus } from "../types/database";

export const STATUS_CLASSES: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  paused: "bg-amber-100 text-amber-800",
  completed: "bg-neutral-100 text-neutral-600",
};

export const STATUS_CYCLE: Record<SessionStatus, SessionStatus> = {
  active: "paused",
  paused: "completed",
  completed: "active",
};

export const STATUS_LABEL: Record<SessionStatus, string> = {
  active: "Active",
  paused: "Paused",
  completed: "Completed",
};

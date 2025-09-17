import { ReviewLog } from "../types";

export const reviewLogs: ReviewLog[] = [
  {
    id: "bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1",
    eventId: "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
    reviewer: "Duty Officer",
    reviewNotes: "Confirmed via official imagery and press release.",
    confidenceAdjustment: "High",
    createdAt: "2024-05-02T14:00:00Z",
  },
  {
    id: "bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbb2",
    eventId: "aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3",
    reviewer: "Analyst",
    reviewNotes: "Single-source OSINT, awaiting satellite confirmation.",
    confidenceAdjustment: "Low",
    createdAt: "2024-04-01T11:00:00Z",
  },
];

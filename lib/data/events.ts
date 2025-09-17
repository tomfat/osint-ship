import { EventRecord } from "../types";

export const events: EventRecord[] = [
  {
    id: "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
    vesselId: "11111111-1111-1111-1111-111111111111",
    eventDate: {
      start: "2024-05-01T08:00:00Z",
    },
    location: {
      latitude: 36.8508,
      longitude: -76.2859,
      locationName: "North Atlantic, east of Norfolk",
    },
    confidence: "High",
    evidenceType: "Official Photo Release",
    summary:
      "USS Gerald R. Ford departed Norfolk with Carrier Strike Group 12 for exercises in the North Atlantic.",
    sourceUrl: "https://www.navy.mil/Press-Office/News-Stories/",
    sourceExcerpt:
      "Carrier Strike Group 12 departed Naval Station Norfolk to conduct joint exercises with NATO partners.",
    lastVerifiedAt: "2024-05-02T12:00:00Z",
    createdAt: "2024-05-02T12:00:00Z",
    updatedAt: "2024-05-02T12:00:00Z",
  },
  {
    id: "aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2",
    vesselId: "22222222-2222-2222-2222-222222222222",
    eventDate: {
      start: "2024-04-18T00:00:00Z",
      end: "2024-04-22T00:00:00Z",
    },
    location: {
      latitude: 21.3069,
      longitude: -157.8583,
      locationName: "Honolulu, Hawaii",
    },
    confidence: "Medium",
    evidenceType: "Media Report",
    summary:
      "Local media reported USS Nimitz conducting port visit in Pearl Harbor prior to Pacific deployment.",
    sourceUrl: "https://news.usni.org/",
    lastVerifiedAt: "2024-04-23T15:30:00Z",
    createdAt: "2024-04-23T15:30:00Z",
    updatedAt: "2024-04-23T15:30:00Z",
  },
  {
    id: "aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3",
    vesselId: "33333333-3333-3333-3333-333333333333",
    eventDate: {
      start: "2024-03-28T00:00:00Z",
    },
    location: {
      locationName: "Western Pacific (exact position undisclosed)",
    },
    confidence: "Low",
    evidenceType: "OSINT Social Media",
    summary:
      "Multiple OSINT observers suggested Theodore Roosevelt transited the South China Sea; no official confirmation.",
    sourceUrl: "https://twitter.com/",
    lastVerifiedAt: "2024-04-01T10:00:00Z",
    createdAt: "2024-04-01T10:00:00Z",
    updatedAt: "2024-04-01T10:00:00Z",
  },
];

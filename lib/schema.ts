import { z } from "zod";

export const confidenceSchema = z.enum(["High", "Medium", "Low"]);

export const vesselSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  hullNumber: z.string(),
  vesselClass: z.string(),
  homeport: z.string().optional(),
  image: z.string().url().optional(),
});

export const eventSchema = z.object({
  id: z.string().uuid(),
  vesselId: z.string().uuid(),
  eventDate: z.object({
    start: z.string().datetime(),
    end: z.string().datetime().optional(),
  }),
  location: z.object({
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    locationName: z.string(),
  }),
  confidence: confidenceSchema,
  evidenceType: z.string(),
  summary: z.string(),
  sourceUrl: z.string().url(),
  sourceExcerpt: z.string().optional(),
  lastVerifiedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const reviewLogSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  reviewer: z.string(),
  reviewNotes: z.string(),
  confidenceAdjustment: confidenceSchema.optional(),
  createdAt: z.string().datetime(),
});

export const statsSchema = z.object({
  totalVessels: z.number().nonnegative(),
  activeDeployments: z.number().nonnegative(),
  eventsLast30Days: z.number().nonnegative(),
  vesselsMissingUpdates: z.number().nonnegative(),
  generatedAt: z.string().datetime(),
});

import { z } from "zod";

export const confidenceSchema = z.enum(["High", "Medium", "Low"]);

export const vesselSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  hullNumber: z.string().nullable(),
  vesselClass: z.string().nullable(),
  homeport: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
});

export const eventSchema = z.object({
  id: z.string().uuid(),
  vesselId: z.string().uuid(),
  eventStart: z.string().datetime(),
  eventEnd: z.string().datetime().nullable(),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  locationName: z.string(),
  confidence: confidenceSchema,
  evidenceType: z.string(),
  summary: z.string(),
  sourceUrl: z.string().url(),
  sourceExcerpt: z.string().nullable(),
  lastVerifiedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const reviewLogSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  reviewer: z.string(),
  reviewNotes: z.string(),
  confidenceAdjustment: confidenceSchema.nullable(),
  createdAt: z.string().datetime(),
});

export const statsSchema = z.object({
  totalVessels: z.number().nonnegative(),
  activeDeployments: z.number().nonnegative(),
  eventsLast30Days: z.number().nonnegative(),
  vesselsMissingUpdates: z.number().nonnegative(),
  generatedAt: z.string().datetime(),
});

import type { PostgrestError } from "@supabase/supabase-js";
import type { ZodError } from "zod";

export class SupabaseQueryError extends Error {
  constructor(message: string, public readonly cause?: PostgrestError) {
    super(message);
    this.name = "SupabaseQueryError";
  }
}

export class SupabaseValidationError extends Error {
  constructor(message: string, public readonly validationError: ZodError) {
    super(message);
    this.name = "SupabaseValidationError";
  }
}

export class SupabaseNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseNotFoundError";
  }
}

import { NextResponse } from "next/server";
import { SupabaseNotFoundError, SupabaseQueryError, SupabaseValidationError } from "./errors";

export function supabaseErrorResponse(error: unknown, fallbackMessage: string) {
  if (error instanceof SupabaseValidationError) {
    return NextResponse.json(
      { error: error.message, details: error.validationError.format() },
      { status: 500 },
    );
  }

  if (error instanceof SupabaseQueryError) {
    return NextResponse.json({ error: error.message, details: error.cause }, { status: 502 });
  }

  if (error instanceof SupabaseNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  console.error(fallbackMessage, error);
  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}

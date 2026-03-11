import { expect } from "vitest";
import { type ZodSafeParseResult } from "zod";

/**
 * Asserts that a Zod safeParse result is valid.
 * On failure, prints each Zod issue path and message instead of a bare boolean diff.
 *
 * Usage:
 *   assertValid(MySchema.safeParse(input));
 */
export function assertValid(result: ZodSafeParseResult<unknown>): void {
  if (!result.success) {
    const msg = result.error.issues
      .map((i: { path: any[]; message: any; }) => `  ${i.path.length > 0 ? i.path.join(".") : "(root)"}: ${i.message}`)
      .join("\n");
    expect.fail(`Expected valid, but got Zod errors:\n${msg}`);
  }
}

/**
 * Asserts that a Zod safeParse result is invalid.
 * On failure (schema accepted the input), prints an optional hint describing
 * what constraint was expected to trigger.
 *
 * Usage:
 *   assertInvalid(MySchema.safeParse(input), "turno must be non-negative");
 */
export function assertInvalid(
  result: ZodSafeParseResult<unknown>,
  hint?: string,
): void {
  if (result.success) {
    expect.fail(
      `Expected invalid${hint ? ` (${hint})` : ""}, but schema accepted the input`,
    );
  }
}

import { type ZodSafeParseResult } from "zod";

/**
 * Represents a processed test case ready for use in `it.each`.
 * * @template SW - The Schema Wrapper object, e.g., `{ AttributeModifierSchema }`.
 *   @template D  - Additional test arbitrary data properties, e.g., `{ status: "valid", description: "other" }`.
 */
export type SchemaLabeledTestCase<SW, D> = {
  label:  string;                   // The name of the variable extracted from the wrapper object.
  schema: NonNullable<SW[keyof SW]> // The actual schema or value extracted from the wrapper object. Explicitly ensure schema is not null/undefined.
} & D;                              // Merge with D

// /**
//  * Maps an array of schema-data pairs into a flat array of labeled test cases.
//  * The second element of the tuple (extra data) is optional.
//  * * @example autoLabels([[ { integer } ]]) -> [{ label: "integer", schema: ... }]
//  *   @example autoLabels([[ { positiveInt }, { val: -1, status: "invalid" } ]]) // -> [{ label: "positiveInt", schema: ..., val: -1, status: "invalid" }]
//  */
export function autoLabels<SW extends Record<string, any>, D extends Record<string, any>>(
  cases: [SW, D?][]
): SchemaLabeledTestCase<SW, D>[] {
  return cases.map(([wrapper, data]) => {
    const entries = Object.entries(wrapper);
    
    if (entries.length === 0) {
      throw new Error("autoLabels: The wrapper object must contain at least one key.");
    }

    const [label, schema] = entries[0];

    // The cast to LabeledTestCase ensures the IDE treats 'schema' as mandatory and correctly typed.
    return {
      label,
      schema: schema as SW[keyof SW],
      ...(data ?? {})
    } as SchemaLabeledTestCase<SW, D>;
  });
}

/**
 * Asserts that a Zod safeParse result is valid.
 * On failure, prints each Zod issue path and message instead of a bare boolean diff.
 *
 * Usage:
 *   assertValid(MySchema.safeParse(input));
 */
export function assertValid(
  result: ZodSafeParseResult<unknown>,
  hint?: string,
): void {
  if (!result.success) {
    const error_msg = result.error.issues
      .map((i: { path: any[]; message: any; }) => `  ${i.path.length > 0 ? i.path.join(".") : "(root)"} -> ${i.message}`)
      .join("\n");
    const message = `Expected valid${hint ? ` (${hint})` : ""}, but got Zod errors:\n${error_msg}`;

    const error = new Error(message);
    // This removes this function from the stacktrace, so error is cleaner
    if ("captureStackTrace" in Error) {
      (Error as any).captureStackTrace(error, assertValid);
    }

    throw error;
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
    const message = `Expected invalid${hint ? ` (${hint})` : ""}, but schema accepted the input`;

    const error = new Error(message);
    // This removes this function from the stacktrace, so error is cleaner
    if ("captureStackTrace" in Error) {
      (Error as any).captureStackTrace(error, assertInvalid);
    }

    throw error;
  }
}

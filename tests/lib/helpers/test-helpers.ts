import { z, type ZodSafeParseResult } from "zod";
import type { EngineErrorCode, EngineResult, EngineWarningCode } from "$lib/engine";
import { expect } from "vitest";

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


/**
 * Recursively applies .strict() to all ZodObject nodes in a schema.
 * Use only in tests to verify example files have no unknown fields.
 * Production schemas remain permissive to allow forward compatibility.
 */
export function makeStrict<T extends z.ZodTypeAny>(schema: T): T {
  if (schema == null) return schema;

  const def = (schema as any).def ?? (schema as any)._zod?.def;
  if (!def) return schema;

  const type = def.type as string;

  switch (type) {
    case "object": {
      const obj = schema as unknown as z.ZodObject<z.ZodRawShape>;
      const strictShape = Object.fromEntries(
        Object.entries(obj.shape).map(([k, v]) => [k, makeStrict(v as z.ZodTypeAny)])
      ) as z.ZodRawShape;
      return z.strictObject(strictShape) as unknown as T;
    }

    case "array": {
      if (!def.element) return schema;
      const element = makeStrict(def.element as z.ZodTypeAny);
      return z.array(element) as unknown as T;
    }

    case "optional": {
      if (!def.inner) return schema;
      const inner = makeStrict(def.inner as z.ZodTypeAny);
      return z.optional(inner) as unknown as T;
    }

    case "union": {
      if (!def.options) return schema;
      const options = (def.options as z.ZodTypeAny[]).map(makeStrict);
      return z.union(options as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]) as unknown as T;
    }

    case "record": {
      if (!def.keyType || !def.valueType) return schema;
      const keyType   = def.keyType as z.core.$ZodRecordKey;
      const valueType = makeStrict(def.valueType as z.ZodTypeAny);
      return z.record(keyType, valueType) as unknown as T;
    }

    case "transform":
    case "preprocess":
    case "pipe": {
      const inner = def.schema ?? def.in ?? def.first;
      if (!inner) return schema;
      return makeStrict(inner as z.ZodTypeAny) as unknown as T;
    }

    default:
      return schema;
  }
}


// ---------------------------------------------------------------------------
// EngineResult Helpers
// ---------------------------------------------------------------------------
export function assertOk(result: EngineResult<any>, expected: any): any {
  const [value, warns, error] = result;
  expect(value).toBe(expected);
  expect(warns).toBeNull();
  expect(error).toBeNull();
}

export function assertError(result: EngineResult<any>, code: EngineErrorCode): void {
  const [value, warns, error] = result;
  expect(value).toBeNull();
  expect(warns).toBeNull();
  expect(error).not.toBeNull();
  expect(error!.code).toBe(code);
}

export function assertOkWarnings(result: EngineResult<any>, expectedValue: any, expectedWarnings: EngineWarningCode[]): void {
  const [value, warns, error] = result;
  expect(value).toBe(expectedValue);
  expect(warns).not.toBeNull();
  expect(warns!.length).toBe(expectedWarnings.length);
  for (const i in warns!) {
    expect(warns![i]).toBe(expectedWarnings[i]);
  }
  expect(error).toBeNull();
}

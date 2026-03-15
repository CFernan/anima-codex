import { describe, it, expect } from "vitest";
import { z } from "zod";
import { schemaFromEnum, uniqueValues } from "$lib/schema/common/utils";
import { assertValid, assertInvalid } from "../../helpers/test-helpers";


// ---------------------------------------------------------------------------
// schemaFromEnum
// ---------------------------------------------------------------------------

const testEnum = z.enum(["value1", "value2"]);
const testSchema = z.object({test: z.string()})

describe("schemaFromEnum", () => {
  it("produces a ZodObject with all enum keys", () => {
    const schema = schemaFromEnum(testEnum, testSchema);
    expect(schema).toBeInstanceOf(z.ZodObject);
    const keys = Object.keys(schema.shape);
    expect(keys).toContain("value1");
    expect(keys).toContain("value2");
    expect(keys).toHaveLength(2);
  });

  it("accepts an object with all required keys", () =>
    assertValid(schemaFromEnum(testEnum, testSchema).safeParse({
      value1: { test: "a" },
      value2: { test: "b" },
    }))
  );

  it("rejects an object missing a required key", () =>
    assertInvalid(schemaFromEnum(testEnum, testSchema).safeParse({
      value1: { test: "a" },
      // value2 intentionally omitted
    }), "value2 is required")
  );

  it("validates value schema on each key", () =>
    assertInvalid(schemaFromEnum(testEnum, testSchema).safeParse({
      value1: -1,
      value2: "b",
    }), "value1 must be string")
  );

  it("all shape values are the same valueSchema reference", () => {
    const schema = schemaFromEnum(testEnum, testSchema);
    expect(schema.shape.value1).toBe(testSchema);
    expect(schema.shape.value2).toBe(testSchema);
  });
});


// ---------------------------------------------------------------------------
// uniqueValues
// ---------------------------------------------------------------------------

describe("uniqueValues", () => {
  it("returns true for an empty array",           () => expect(uniqueValues()([])).toBe(true));
  it("returns true for a single-element array",   () => expect(uniqueValues()(["a"])).toBe(true));
  it("returns true for unique string values",     () => expect(uniqueValues()(["a", "b", "c"])).toBe(true));
  it("returns false for duplicate string values", () => expect(uniqueValues()(["a", "b", "a"])).toBe(false));
  it("returns true for unique numbers",           () => expect(uniqueValues()([1, 2, 3])).toBe(true));
  it("returns false for duplicate numbers",       () => expect(uniqueValues()([1, 2, 1])).toBe(false));

  type helperStruct = { id: string };
  it("returns true when uses key extractor for objects with unique keys", () => {
    const items: helperStruct[] = [{ id: "a" }, { id: "b" }, { id: "c" }];
    expect(uniqueValues((x: helperStruct) => x.id)(items)).toBe(true);
  });

  it("returns false when uses key extractor objects with duplicate keys", () => {
    const items: helperStruct[] = [{ id: "a" }, { id: "b" }, { id: "a" }];
    expect(uniqueValues((x: helperStruct) => x.id)(items)).toBe(false);
  });

  it("works as a Zod .refine() predicate", () => {
    const schema = z.array(z.string()).refine(uniqueValues(), { message: "duplicates" });
    assertValid(schema.safeParse(["x", "y", "z"]));
    assertInvalid(schema.safeParse(["x", "y", "x"]), "duplicate strings");
  });

  it("compares by reference for objects without key extractor", () => {
    const item: helperStruct = { id: "a" };
    expect(uniqueValues()([item, item])).toBe(false);
  });
});

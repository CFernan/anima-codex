import { describe, it, expect } from "vitest";
import { z } from "zod";
import { getSubSchemaFromPath, schemaFromEnum, uniqueValues } from "$lib/schema/common/utils";
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


// ---------------------------------------------------------------------------
// getSubSchemaFromPath
// ---------------------------------------------------------------------------

describe("getSubSchemaFromPath", () => {
  const testSchema = z.object({
    root: z.object({
      string_basic: z.string(),
      enum_basic: z.enum(["dummy", "dork"]),
      number_basic: z.number(),
      bool_basic: z.boolean(),
      union_basic: z.union([z.string(), z.number()]),

      number_min_max: z.number().min(1).max(20),
      number_multiple: z.number().int().multipleOf(5),

      bool_default: z.boolean().default(false),
      bool_optional: z.boolean().optional(),
      bool_nullable: z.boolean().nullable(),

      object_basic: z.object({
        string_basic: z.string(),
      }),
      array_basic: z.array(z.number()),

      object_default: z.object({
        string_basic: z.string(),
      }).default({ string_basic: "default" }),
      object_optional: z.object({
        string_basic: z.string(),
      }).optional(),
      object_nullable: z.object({
        string_basic: z.string(),
      }).nullable(),

      array_composed: z.array(
        z.object({
          number_basic: z.number(),
        })
      ),
      array_composed_array: z.array(
        z.array(
          z.object({
            number_basic: z.number(),
          })
        )
      ),
      array_refined: z.array(z.number()).refine(data => data.length > 0),
    }),
  });

  describe("Primitive and Basic Types", () => {
    it("should retrieve ZodString", () => {
      expect(getSubSchemaFromPath(testSchema, "root/string_basic")).toBeInstanceOf(z.ZodString);
    });

    it("should retrieve ZodEnum", () => {
      const result = getSubSchemaFromPath(testSchema, "root/enum_basic");
      expect(result).toBeInstanceOf(z.ZodEnum);
      if (result instanceof z.ZodEnum) {
        expect(result.options).toEqual(["dummy", "dork"]);
      }
    });

    it("should retrieve ZodNumber", () => {
      expect(getSubSchemaFromPath(testSchema, "root/number_basic")).toBeInstanceOf(z.ZodNumber);
    });

    it("should retrieve ZodBoolean", () => {
      expect(getSubSchemaFromPath(testSchema, "root/bool_basic")).toBeInstanceOf(z.ZodBoolean);
    });

    it("should retrieve ZodUnion", () => {
      const result = getSubSchemaFromPath(testSchema, "root/union_basic");
      expect(result).toBeInstanceOf(z.ZodUnion);
    });

    it("should retrieve ZodObject", () => {
      const result = getSubSchemaFromPath(testSchema, "root/object_basic");
      expect(result).toBeInstanceOf(z.ZodObject);
    });

    it("should retrieve ZodArray", () => {
      const result = getSubSchemaFromPath(testSchema, "root/array_basic");
      expect(result).toBeInstanceOf(z.ZodArray);
    });
  });

  describe("Numeric Constraints (Refinements)", () => {
    it("should preserve min/max constraints", () => {
      const result = getSubSchemaFromPath(testSchema, "root/number_min_max");
      expect(result).toBeInstanceOf(z.ZodNumber);
      expect(result?.safeParse(1 ).success).toBe(true);
      expect(result?.safeParse(10).success).toBe(true);
      expect(result?.safeParse(20).success).toBe(true);
      expect(result?.safeParse(0 ).success).toBe(false);
      expect(result?.safeParse(21).success).toBe(false);
    });

    it("should preserve multipleOf constraint", () => {
      const result = getSubSchemaFromPath(testSchema, "root/number_multiple");
      expect(result).toBeInstanceOf(z.ZodNumber);
      expect(result?.safeParse(7 ).success).toBe(false);
      expect(result?.safeParse(10).success).toBe(true);
    });
  });

  describe("Modifiers: Optional, Default, Nullable", () => {
    // Unpeeled (Metadata)
    it("should return ZodDefault", () => {
      expect(getSubSchemaFromPath(testSchema, "root/bool_default")).toBeInstanceOf(z.ZodDefault);
      expect(getSubSchemaFromPath(testSchema, "root/object_default")).toBeInstanceOf(z.ZodDefault);
    });

    it("should return ZodOptional", () => {
      expect(getSubSchemaFromPath(testSchema, "root/bool_optional")).toBeInstanceOf(z.ZodOptional);
      expect(getSubSchemaFromPath(testSchema, "root/object_optional")).toBeInstanceOf(z.ZodOptional);
    });

    it("should return ZodNullable", () => {
      expect(getSubSchemaFromPath(testSchema, "root/bool_nullable")).toBeInstanceOf(z.ZodNullable);
      expect(getSubSchemaFromPath(testSchema, "root/object_nullable")).toBeInstanceOf(z.ZodNullable);
    });

    // Peeled (Trailing Slash)
    it("should return core type when ZodDefault is peeled", () => {
      expect(getSubSchemaFromPath(testSchema, "root/bool_default/")).toBeInstanceOf(z.ZodBoolean);
      expect(getSubSchemaFromPath(testSchema, "root/object_default/")).toBeInstanceOf(z.ZodObject);
    });

    it("should return core type when ZodOptional is peeled", () => {
      expect(getSubSchemaFromPath(testSchema, "root/bool_optional/")).toBeInstanceOf(z.ZodBoolean);
      expect(getSubSchemaFromPath(testSchema, "root/object_optional/")).toBeInstanceOf(z.ZodObject);
    });

    it("should return core type when ZodNullable is peeled", () => {
      expect(getSubSchemaFromPath(testSchema, "root/bool_nullable/")).toBeInstanceOf(z.ZodBoolean);
      expect(getSubSchemaFromPath(testSchema, "root/object_nullable/")).toBeInstanceOf(z.ZodObject);
    });
  });

  describe("Structural Types", () => {
    it("should navigate into basic objects", () => {
      expect(getSubSchemaFromPath(testSchema, "root/object_basic/string_basic"))
        .toBeInstanceOf(z.ZodString);
    });

    it("should navigate into objects with modifiers", () => {
      expect(getSubSchemaFromPath(testSchema, "root/object_default/string_basic"))
        .toBeInstanceOf(z.ZodString);
      expect(getSubSchemaFromPath(testSchema, "root/object_optional/string_basic"))
        .toBeInstanceOf(z.ZodString);
      expect(getSubSchemaFromPath(testSchema, "root/object_nullable/string_basic"))
        .toBeInstanceOf(z.ZodString);
    });

    it("should navigate into basic arrays using []", () => {
      expect(getSubSchemaFromPath(testSchema, "root/array_basic/[]"))
        .toBeInstanceOf(z.ZodNumber);
    });

    it("should navigate into composed arrays", () => {
      expect(getSubSchemaFromPath(testSchema, "root/array_composed/[]/number_basic"))
        .toBeInstanceOf(z.ZodNumber);
    });

    it("should handle multi-level array nesting", () => {
      expect(getSubSchemaFromPath(testSchema, "root/array_composed_array/[]/[]/number_basic"))
        .toBeInstanceOf(z.ZodNumber);
    });

    it("should handle refine and peeling", () => {
      expect(getSubSchemaFromPath(testSchema, "root/array_refined"))
        .toBeInstanceOf(z.ZodArray);

      expect(getSubSchemaFromPath(testSchema, "root/array_refined/"))
        .toBeInstanceOf(z.ZodArray);
    });
  });

  describe("Edge Cases and Safety", () => {
    it("should return undefined for non-existent path", () => {
      expect(getSubSchemaFromPath(testSchema, "root/ghost_key")).toBeUndefined();
    });

    it("should return undefined when array syntax [] is used on a non-array", () => {
      expect(getSubSchemaFromPath(testSchema, "root/string_basic/[]")).toBeUndefined();
    });

    it("should return the original schema if path is empty", () => {
      const basicSchema = z.object().optional();
      expect(getSubSchemaFromPath(basicSchema, "")).toBe(basicSchema);
    });

    it("should return the original peeled schema if path is /", () => {
      const basicSchema = z.object().optional();
      expect(getSubSchemaFromPath(basicSchema, "/")).toBeInstanceOf(z.ZodObject);
    });
  });
});

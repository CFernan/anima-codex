import { describe, it, expect } from "vitest";
import {
  AttributeModifierSchema,
  DirectAttributeSchema,
  PDAttributeSchema,
  HybridAttributeSchema,
} from "../../../src/lib/schema/attribute";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const validModifier = {
  valor: 5,
  fuente: "Raza",
  automatico: true,
};

const emptyModifiers = {
  modificadores_base: [],
  modificadores_temporales: [],
};

// ---------------------------------------------------------------------------
// AttributeModifierSchema
// ---------------------------------------------------------------------------

describe("AttributeModifierSchema", () => {
  it("accepts a valid modifier", () => {
    expect(AttributeModifierSchema.safeParse(validModifier).success).toBe(true);
  });

  it("accepts a modifier with optional descriptor", () => {
    const result = AttributeModifierSchema.safeParse({ ...validModifier, descriptor: "Bonus racial" });
    expect(result.success).toBe(true);
  });

  it("accepts negative valor", () => {
    expect(AttributeModifierSchema.safeParse({ ...validModifier, valor: -10 }).success).toBe(true);
  });

  it("accepts valor of zero", () => {
    expect(AttributeModifierSchema.safeParse({ ...validModifier, valor: 0 }).success).toBe(true);
  });

  it("fails when valor is missing", () => {
    const { valor, ...rest } = validModifier;
    expect(AttributeModifierSchema.safeParse(rest).success).toBe(false);
  });

  it("fails when fuente is missing", () => {
    const { fuente, ...rest } = validModifier;
    expect(AttributeModifierSchema.safeParse(rest).success).toBe(false);
  });

  it("fails when automatico is missing", () => {
    const { automatico, ...rest } = validModifier;
    expect(AttributeModifierSchema.safeParse(rest).success).toBe(false);
  });

  it("fails when automatico is not boolean", () => {
    expect(AttributeModifierSchema.safeParse({ ...validModifier, automatico: 1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// DirectAttributeSchema
// ---------------------------------------------------------------------------

describe("DirectAttributeSchema", () => {
  it("accepts a valid direct attribute", () => {
    const result = DirectAttributeSchema.safeParse({ base: 10, ...emptyModifiers });
    expect(result.success).toBe(true);
  });

  it("accepts base of zero", () => {
    expect(DirectAttributeSchema.safeParse({ base: 0, ...emptyModifiers }).success).toBe(true);
  });

  it("fails when base is negative", () => {
    expect(DirectAttributeSchema.safeParse({ base: -1, ...emptyModifiers }).success).toBe(false);
  });

  it("fails when base is not an integer", () => {
    expect(DirectAttributeSchema.safeParse({ base: 5.5, ...emptyModifiers }).success).toBe(false);
  });

  it("fails when base is missing", () => {
    expect(DirectAttributeSchema.safeParse(emptyModifiers).success).toBe(false);
  });

  it("accepts modifiers in both arrays", () => {
    const result = DirectAttributeSchema.safeParse({
      base: 10,
      modificadores_base: [validModifier],
      modificadores_temporales: [{ ...validModifier, automatico: false }],
    });
    expect(result.success).toBe(true);
  });

  it("fails when modificadores_base is missing", () => {
    expect(DirectAttributeSchema.safeParse({ base: 10, modificadores_temporales: [] }).success).toBe(false);
  });

  it("fails when a modifier inside the array is invalid", () => {
    const result = DirectAttributeSchema.safeParse({
      base: 10,
      modificadores_base: [{ valor: 5 }], // missing fuente and automatico
      modificadores_temporales: [],
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// PDAttributeSchema
// ---------------------------------------------------------------------------

describe("PDAttributeSchema", () => {
  it("accepts a valid PD attribute", () => {
    expect(PDAttributeSchema.safeParse({ pd: 20, ...emptyModifiers }).success).toBe(true);
  });

  it("accepts pd of zero", () => {
    expect(PDAttributeSchema.safeParse({ pd: 0, ...emptyModifiers }).success).toBe(true);
  });

  it("fails when pd is negative", () => {
    expect(PDAttributeSchema.safeParse({ pd: -5, ...emptyModifiers }).success).toBe(false);
  });

  it("fails when pd is not an integer", () => {
    expect(PDAttributeSchema.safeParse({ pd: 2.5, ...emptyModifiers }).success).toBe(false);
  });

  it("fails when pd is missing", () => {
    expect(PDAttributeSchema.safeParse(emptyModifiers).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// HybridAttributeSchema
// ---------------------------------------------------------------------------

describe("HybridAttributeSchema", () => {
  it("accepts a valid hybrid attribute", () => {
    expect(HybridAttributeSchema.safeParse({ base: 40, pd: 0, ...emptyModifiers }).success).toBe(true);
  });

  it("accepts base and pd both zero", () => {
    expect(HybridAttributeSchema.safeParse({ base: 0, pd: 0, ...emptyModifiers }).success).toBe(true);
  });

  it("fails when base is negative", () => {
    expect(HybridAttributeSchema.safeParse({ base: -1, pd: 0, ...emptyModifiers }).success).toBe(false);
  });

  it("fails when pd is negative", () => {
    expect(HybridAttributeSchema.safeParse({ base: 40, pd: -1, ...emptyModifiers }).success).toBe(false);
  });

  it("fails when base is missing", () => {
    expect(HybridAttributeSchema.safeParse({ pd: 0, ...emptyModifiers }).success).toBe(false);
  });

  it("fails when pd is missing", () => {
    expect(HybridAttributeSchema.safeParse({ base: 40, ...emptyModifiers }).success).toBe(false);
  });
});

import { describe, it } from "vitest";
import {
  AttributeModifierSchema,
  DirectAttributeSchema,
  PDAttributeSchema,
  DerivedAttributeSchema,
} from "$lib/schema/attribute_type";
import { assertInvalid, assertValid } from "../helpers/test-helpers";

const validModifier = { valor: 5, fuente: "Arma" };
const emptyModifiers = { modificadores_base: [], modificadores_temporales: [] };

// ---------------------------------------------------------------------------
// AttributeModifierSchema
// ---------------------------------------------------------------------------

describe("AttributeModifierSchema", () => {
  it("accepts a valid modifier", () => {
    assertValid(AttributeModifierSchema.safeParse(validModifier));
  });

  it("accepts a modifier with optional descriptor", () => {
    assertValid(AttributeModifierSchema.safeParse({ ...validModifier, descriptor: "Bonus" }));
  });

  it("accepts negative valor", () => {
    assertValid(AttributeModifierSchema.safeParse({ ...validModifier, valor: -10 }));
  });

  it("accepts valor of zero", () => {
    assertValid(AttributeModifierSchema.safeParse({ ...validModifier, valor: 0 }));
  });

  it("fails when valor is not a number", () => {
    assertInvalid(AttributeModifierSchema.safeParse({ ...validModifier, valor: "10" }), "valor must be a number");
  });

  it("fails when valor is missing", () => {
    const { valor, ...rest } = validModifier;
    assertInvalid(AttributeModifierSchema.safeParse(rest), "valor is required");
  });

  it("fails when fuente is missing", () => {
    const { fuente, ...rest } = validModifier;
    assertInvalid(AttributeModifierSchema.safeParse(rest), "fuente is required");
  });
});

// ---------------------------------------------------------------------------
// DirectAttributeSchema
// ---------------------------------------------------------------------------

describe("DirectAttributeSchema", () => {
  it("accepts a valid direct attribute", () => {
    assertValid(DirectAttributeSchema.safeParse({ base: 10 }));
  });

  it("accepts base of zero", () => {
    assertValid(DirectAttributeSchema.safeParse({ base: 0 }));
  });

  it("fails when base is negative", () => {
    assertInvalid(DirectAttributeSchema.safeParse({ base: -1 }), "base must be non-negative");
  });

  it("fails when base is not an integer", () => {
    assertInvalid(DirectAttributeSchema.safeParse({ base: 5.5 }), "base must be an integer");
  });

  it("fails when base is missing", () => {
    assertInvalid(DirectAttributeSchema.safeParse(emptyModifiers), "base is required");
  });

  it("accepts base + modificadores_temporales", () => {
    assertValid(DirectAttributeSchema.safeParse({
      base: 10,
      modificadores_temporales: [validModifier],
    }));
  });

  it("accepts modifiers in both arrays", () => {
    assertValid(DirectAttributeSchema.safeParse({
      base: 10,
      modificadores_base: [validModifier],
      modificadores_temporales: [validModifier, validModifier],
    }));
  });

  it("fails when a modifier inside the array is invalid", () => {
    assertInvalid(
      DirectAttributeSchema.safeParse({
        base: 10,
        modificadores_base: [{ valor: 5, invalid: 1 }],
      }),
      "modifier is missing fuente",
    );
  });
});

// ---------------------------------------------------------------------------
// PDAttributeSchema
// ---------------------------------------------------------------------------

describe("PDAttributeSchema", () => {
  it("accepts a valid PD attribute", () => {
    assertValid(PDAttributeSchema.safeParse({ pd: 20, ...emptyModifiers }));
  });

  it("accepts pd of zero", () => {
    assertValid(PDAttributeSchema.safeParse({ pd: 0, ...emptyModifiers }));
  });

  it("fails when pd is negative", () => {
    assertInvalid(PDAttributeSchema.safeParse({ pd: -5, ...emptyModifiers }), "pd must be non-negative");
  });

  it("fails when pd is not an integer", () => {
    assertInvalid(PDAttributeSchema.safeParse({ pd: 2.5, ...emptyModifiers }), "pd must be an integer");
  });

  it("fails when pd is missing", () => {
    assertInvalid(PDAttributeSchema.safeParse(emptyModifiers), "pd is required");
  });
  
  it("accepts pd + modificadores_temporales", () => {
    assertValid(PDAttributeSchema.safeParse({
      pd: 10,
      modificadores_temporales: [validModifier],
    }));
  });

  it("accepts modifiers in both arrays", () => {
    assertValid(PDAttributeSchema.safeParse({
      pd: 10,
      modificadores_base: [validModifier],
      modificadores_temporales: [validModifier, validModifier],
    }));
  });

  it("fails when a modifier inside the array is invalid", () => {
    assertInvalid(
      PDAttributeSchema.safeParse({
        pd: 10,
        modificadores_base: [{ valor: 5, invalid: 1 }],
      }),
      "modifier is missing fuente",
    );
  });
});

// ---------------------------------------------------------------------------
// DerivedAttributeSchema
// ---------------------------------------------------------------------------

describe("DerivedAttributeSchema", () => {
  it("accepts an empty object", () => {
    assertValid(DerivedAttributeSchema.safeParse({}));
  });

  it("accepts only modificadores_base", () => {
    assertValid(DerivedAttributeSchema.safeParse({
      modificadores_base: [validModifier],
    }));
  });

  it("accepts only modificadores_temporales", () => {
    assertValid(DerivedAttributeSchema.safeParse({
      modificadores_temporales: [validModifier],
    }));
  });

  it("accepts modifiers in both arrays", () => {
    assertValid(DerivedAttributeSchema.safeParse({
      modificadores_base: [validModifier],
      modificadores_temporales: [validModifier, validModifier],
    }));
  });

  it("accepts empty modifier arrays", () => {
    assertValid(DerivedAttributeSchema.safeParse({
      modificadores_base: [],
      modificadores_temporales: [],
    }));
  });

  it("fails when a modifier inside modificadores_base is invalid", () => {
    assertInvalid(
      DerivedAttributeSchema.safeParse({
        modificadores_base: [{ valor: 5, invalid: 1 }],
      }),
      "modifier is missing fuente",
    );
  });

  it("fails when a modifier inside modificadores_temporales is invalid", () => {
    assertInvalid(
      DerivedAttributeSchema.safeParse({
        modificadores_temporales: [{ fuente: "test" }],
      }),
      "modifier is missing valor",
    );
  });
});

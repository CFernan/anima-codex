import { describe, it } from "vitest";
import {
  CharacteristicInvestmentSchema,
  PhysicalCapacitiesInvestmentSchema,
  SecondaryCharacteristicInvestmentSchema,
  ResistencesInvestmentSchema,
} from "$lib/schema/characteristic";
import { assertValid, assertInvalid } from "../helpers/test-helpers";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const validDerived = {};

// ---------------------------------------------------------------------------
// CharacteristicInvestmentSchema
// All 8 characteristics — DirectAttributeSchema with base > 0
// ---------------------------------------------------------------------------

const validCharacteristics = {
  agi: { base: 5 }, con: { base: 5 }, des: { base: 5 }, fue: { base: 5 },
  int: { base: 5 }, per: { base: 5 }, pod: { base: 5 }, vol: { base: 5 },
};

describe("CharacteristicInvestmentSchema", () => {
  it("accepts all eight characteristics", () => {
    assertValid(CharacteristicInvestmentSchema.safeParse(validCharacteristics));
  });

  it("fails when a characteristic is missing", () => {
    const { agi, ...rest } = validCharacteristics;
    assertInvalid(CharacteristicInvestmentSchema.safeParse(rest), "agi is required");
  });

  it("fails when base is zero", () => {
    assertInvalid(
      CharacteristicInvestmentSchema.safeParse({ ...validCharacteristics, agi: { base: 0 } }),
      "all characteristic bases must be greater than 0",
    );
  });

  it("fails when base is negative", () => {
    assertInvalid(
      CharacteristicInvestmentSchema.safeParse({ ...validCharacteristics, con: { base: -1 } }),
      "base must be non-negative",
    );
  });

  it("fails when base is not an integer", () => {
    assertInvalid(
      CharacteristicInvestmentSchema.safeParse({ ...validCharacteristics, des: { base: 5.5 } }),
      "base must be an integer",
    );
  });

  it("accepts modifiers on a characteristic", () => {
    assertValid(CharacteristicInvestmentSchema.safeParse({
      ...validCharacteristics,
      fue: {
        base: 8,
        modificadores_base: [{ valor: 2, fuente: "Legado custom" }],
      },
    }));
  });
});

// ---------------------------------------------------------------------------
// PhysicalCapacitiesInvestmentSchema
// 3 capacities — DerivedAttributeSchema (no required fields)
// ---------------------------------------------------------------------------

const validPhysical = {
  tipo_de_movimiento: validDerived,
  indice_de_peso:     validDerived,
  cansancio:          validDerived,
};

describe("PhysicalCapacitiesInvestmentSchema", () => {
  it("accepts all three physical capacities", () => {
    assertValid(PhysicalCapacitiesInvestmentSchema.safeParse(validPhysical));
  });

  it("fails when a capacity is missing", () => {
    const { cansancio, ...rest } = validPhysical;
    assertInvalid(PhysicalCapacitiesInvestmentSchema.safeParse(rest), "cansancio is required");
  });

  it("accepts modifiers on a capacity", () => {
    assertValid(PhysicalCapacitiesInvestmentSchema.safeParse({
      ...validPhysical,
      cansancio: { modificadores_temporales: [{ valor: -2, fuente: "Maldición" }] },
    }));
  });
});

// ---------------------------------------------------------------------------
// SecondaryCharacteristicInvestmentSchema
// apariencia — DirectAttributeSchema (base required)
// tamaño     — DerivedAttributeSchema (no required fields)
// ---------------------------------------------------------------------------

const validSecondary = {
  apariencia: { base: 5 },
  tamaño:     validDerived,
};

describe("SecondaryCharacteristicInvestmentSchema", () => {
  it("accepts apariencia and tamaño", () => {
    assertValid(SecondaryCharacteristicInvestmentSchema.safeParse(validSecondary));
  });

  it("fails when apariencia is missing", () => {
    const { apariencia, ...rest } = validSecondary;
    assertInvalid(SecondaryCharacteristicInvestmentSchema.safeParse(rest), "apariencia is required");
  });

  it("fails when tamaño is missing", () => {
    const { tamaño, ...rest } = validSecondary;
    assertInvalid(SecondaryCharacteristicInvestmentSchema.safeParse(rest), "tamaño is required");
  });

  it("fails when apariencia base is missing", () => {
    assertInvalid(
      SecondaryCharacteristicInvestmentSchema.safeParse({ ...validSecondary, apariencia: {} }),
      "base is required",
    );
  });

  it("fails when apariencia base is negative", () => {
    assertInvalid(
      SecondaryCharacteristicInvestmentSchema.safeParse({ ...validSecondary, apariencia: { base: -1 } }),
      "base must be non-negative",
    );
  });

  it("accepts modifiers on tamaño", () => {
    assertValid(SecondaryCharacteristicInvestmentSchema.safeParse({
      ...validSecondary,
      tamaño: { modificadores_base: [{ valor: 1, fuente: "Hechizo" }] },
    }));
  });
});

// ---------------------------------------------------------------------------
// ResistencesInvestmentSchema
// presencia + 5 resistances — DerivedAttributeSchema
// ---------------------------------------------------------------------------

const validResistences = {
  presencia: validDerived,
  rf: validDerived,
  re: validDerived,
  rv: validDerived,
  rm: validDerived,
  rp: validDerived,
};

describe("ResistencesInvestmentSchema", () => {
  it("accepts all resistances and presencia", () => {
    assertValid(ResistencesInvestmentSchema.safeParse(validResistences));
  });

  for (const key of ["presencia", "rf", "re", "rv", "rm", "rp"] as const) {
    it(`fails when ${key} is missing`, () => {
      const { [key]: _removed, ...rest } = validResistences;
      assertInvalid(ResistencesInvestmentSchema.safeParse(rest), `${key} is required`);
    });
  }

  it("accepts modifiers on a resistance", () => {
    assertValid(ResistencesInvestmentSchema.safeParse({
      ...validResistences,
      rm: { modificadores_base: [{ valor: 10, fuente: "Bono categoría" }] },
    }));
  });
});

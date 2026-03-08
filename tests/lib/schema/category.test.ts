import { describe, it, expect } from "vitest";
import { CategoryDefinitionSchema } from "../../../src/lib/schema/category";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const validCategory = {
  arquetipos:        ["Luchador"] as const,
  turno:             5,
  pv:                15,
  coste_multiplo_pv: 15,
  limite_combate:    0.6,
  limite_magia:      0.5,
  limite_psi:        0.5,
  combate: {
    habilidad_ataque:  2,
    habilidad_parada:  2,
    habilidad_esquiva: 2,
    llevar_armadura:   2,
  },
  secundarias: {
    atleticas:     { coste: 2 },
    sociales:      { coste: 2 },
    perceptivas:   { coste: 2 },
    intelectuales: { coste: 3 },
    vigor:         { coste: 2 },
    subterfugio:   { coste: 2 },
    creativas:     { coste: 2 },
  },
  bonificadores_innatos: {
    primarias:   {},
    secundarias: {},
  },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CategoryDefinitionSchema", () => {
  it("accepts a valid category", () => {
    const result = CategoryDefinitionSchema.safeParse(validCategory);
    expect(result.success).toBe(true);
  });

  it("accepts empty arquetipos array", () => {
    const result = CategoryDefinitionSchema.safeParse({ ...validCategory, arquetipos: [] });
    expect(result.success).toBe(true);
  });

  it("accepts multiple arquetipos", () => {
    const result = CategoryDefinitionSchema.safeParse({ ...validCategory, arquetipos: ["Luchador", "Místico"] });
    expect(result.success).toBe(true);
  });

  it("fails with unknown arquetipo", () => {
    const result = CategoryDefinitionSchema.safeParse({ ...validCategory, arquetipos: ["Desconocido"] });
    expect(result.success).toBe(false);
  });

  it("fails when turno is negative", () => {
    const result = CategoryDefinitionSchema.safeParse({ ...validCategory, turno: -1 });
    expect(result.success).toBe(false);
  });

  it("fails when turno is not an integer", () => {
    const result = CategoryDefinitionSchema.safeParse({ ...validCategory, turno: 5.5 });
    expect(result.success).toBe(false);
  });

  it("accepts turno of zero", () => {
    const result = CategoryDefinitionSchema.safeParse({ ...validCategory, turno: 0 });
    expect(result.success).toBe(true);
  });

  it("fails when pv is negative", () => {
    const result = CategoryDefinitionSchema.safeParse({ ...validCategory, pv: -1 });
    expect(result.success).toBe(false);
  });

  it("fails when coste_multiplo_pv is zero", () => {
    const result = CategoryDefinitionSchema.safeParse({ ...validCategory, coste_multiplo_pv: 0 });
    expect(result.success).toBe(false);
  });

  it("fails when coste_multiplo_pv is negative", () => {
    const result = CategoryDefinitionSchema.safeParse({ ...validCategory, coste_multiplo_pv: -5 });
    expect(result.success).toBe(false);
  });

  it("fails when limite_combate exceeds 1", () => {
    const result = CategoryDefinitionSchema.safeParse({ ...validCategory, limite_combate: 1.1 });
    expect(result.success).toBe(false);
  });

  it("fails when limite_magia is negative", () => {
    const result = CategoryDefinitionSchema.safeParse({ ...validCategory, limite_magia: -0.1 });
    expect(result.success).toBe(false);
  });

  it("fails when a combat cost is zero", () => {
    const result = CategoryDefinitionSchema.safeParse({
      ...validCategory,
      combate: { ...validCategory.combate, habilidad_ataque: 0 },
    });
    expect(result.success).toBe(false);
  });

  it("fails when a combat cost is negative", () => {
    const result = CategoryDefinitionSchema.safeParse({
      ...validCategory,
      combate: { ...validCategory.combate, llevar_armadura: -1 },
    });
    expect(result.success).toBe(false);
  });

  it("fails when a secondary group coste is zero", () => {
    const result = CategoryDefinitionSchema.safeParse({
      ...validCategory,
      secundarias: { ...validCategory.secundarias, atleticas: { coste: 0 } },
    });
    expect(result.success).toBe(false);
  });

  it("accepts secondary group with overrides", () => {
    const result = CategoryDefinitionSchema.safeParse({
      ...validCategory,
      secundarias: {
        ...validCategory.secundarias,
        vigor: { coste: 2, overrides: { p_fuerza: 1, res_dolor: 3 } },
      },
    });
    expect(result.success).toBe(true);
  });

  it("fails when an override cost is zero", () => {
    const result = CategoryDefinitionSchema.safeParse({
      ...validCategory,
      secundarias: {
        ...validCategory.secundarias,
        vigor: { coste: 2, overrides: { p_fuerza: 0 } },
      },
    });
    expect(result.success).toBe(false);
  });

  it("accepts bonificadores_innatos with values", () => {
    const result = CategoryDefinitionSchema.safeParse({
      ...validCategory,
      bonificadores_innatos: {
        primarias:   { habilidad_ataque: 5 },
        secundarias: { acrobacias: 10, saltar: 10 },
      },
    });
    expect(result.success).toBe(true);
  });

  it("fails when a bonificador is negative", () => {
    const result = CategoryDefinitionSchema.safeParse({
      ...validCategory,
      bonificadores_innatos: {
        primarias:   {},
        secundarias: { acrobacias: -5 },
      },
    });
    expect(result.success).toBe(false);
  });
});

import { describe, it } from "vitest";
import { CategoryRuleDefinitionSchema } from "$lib/schema/category";
import { assertValid, assertInvalid } from "../helpers/test-helpers";

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
    assertValid(CategoryRuleDefinitionSchema.safeParse(validCategory));
  });

  it("accepts empty arquetipos array", () => {
    assertValid(CategoryRuleDefinitionSchema.safeParse({ ...validCategory, arquetipos: [] }));
  });

  it("accepts multiple arquetipos", () => {
    assertValid(CategoryRuleDefinitionSchema.safeParse({ ...validCategory, arquetipos: ["Luchador", "Místico"] }));
  });

  it("fails when arquetipos contains duplicates", () => {
    assertInvalid(
      CategoryRuleDefinitionSchema.safeParse({ ...validCategory, arquetipos: ["Luchador", "Luchador"] }),
      "arquetipos must not contain duplicates",
    );
  });

  it("fails with unknown arquetipo", () => {
    assertInvalid(
      CategoryRuleDefinitionSchema.safeParse({ ...validCategory, arquetipos: ["Desconocido"] }),
      "arquetipo must be a valid ArquetipoEnum value",
    );
  });

  it("fails when turno is negative", () => {
    assertInvalid(
      CategoryRuleDefinitionSchema.safeParse({ ...validCategory, turno: -1 }),
      "turno must be non-negative",
    );
  });

  it("fails when turno is not an integer", () => {
    assertInvalid(
      CategoryRuleDefinitionSchema.safeParse({ ...validCategory, turno: 5.5 }),
      "turno must be an integer",
    );
  });

  it("accepts turno of zero", () => {
    assertValid(CategoryRuleDefinitionSchema.safeParse({ ...validCategory, turno: 0 }));
  });

  it("fails when pv is negative", () => {
    assertInvalid(
      CategoryRuleDefinitionSchema.safeParse({ ...validCategory, pv: -1 }),
      "pv must be non-negative",
    );
  });

  it("fails when coste_multiplo_pv is zero", () => {
    assertInvalid(
      CategoryRuleDefinitionSchema.safeParse({ ...validCategory, coste_multiplo_pv: 0 }),
      "coste_multiplo_pv must be positive",
    );
  });

  it("fails when coste_multiplo_pv is negative", () => {
    assertInvalid(
      CategoryRuleDefinitionSchema.safeParse({ ...validCategory, coste_multiplo_pv: -5 }),
      "coste_multiplo_pv must be positive",
    );
  });

  it("fails when limite_combate exceeds 1", () => {
    assertInvalid(
      CategoryRuleDefinitionSchema.safeParse({ ...validCategory, limite_combate: 1.1 }),
      "limite_combate must be <= 1",
    );
  });

  it("fails when limite_magia is negative", () => {
    assertInvalid(
      CategoryRuleDefinitionSchema.safeParse({ ...validCategory, limite_magia: -0.1 }),
      "limite_magia must be >= 0",
    );
  });

  it("fails when a combat cost is zero", () => {
    assertInvalid(
      CategoryRuleDefinitionSchema.safeParse({
        ...validCategory,
        combate: { ...validCategory.combate, habilidad_ataque: 0 },
      }),
      "combat skill cost must be positive",
    );
  });

  it("fails when a combat cost is negative", () => {
    assertInvalid(
      CategoryRuleDefinitionSchema.safeParse({
        ...validCategory,
        combate: { ...validCategory.combate, llevar_armadura: -1 },
      }),
      "combat skill cost must be positive",
    );
  });

  it("fails when a secondary group coste is zero", () => {
    assertInvalid(
      CategoryRuleDefinitionSchema.safeParse({
        ...validCategory,
        secundarias: { ...validCategory.secundarias, atleticas: { coste: 0 } },
      }),
      "secondary group coste must be positive",
    );
  });

  it("accepts secondary group with valid sobreescribe", () => {
    assertValid(CategoryRuleDefinitionSchema.safeParse({
      ...validCategory,
      secundarias: {
        ...validCategory.secundarias,
        vigor: { coste: 2, sobreescribe: { p_fuerza: 1, res_dolor: 3 } },
      },
    }));
  });

  it("fails when an override cost is zero", () => {
    assertInvalid(
      CategoryRuleDefinitionSchema.safeParse({
        ...validCategory,
        secundarias: {
          ...validCategory.secundarias,
          vigor: { coste: 2, sobreescribe: { p_fuerza: 0 } },
        },
      }),
      "override cost must be positive",
    );
  });

  it("fails when an override key does not belong to its group", () => {
    assertInvalid(
      CategoryRuleDefinitionSchema.safeParse({
        ...validCategory,
        secundarias: {
          ...validCategory.secundarias,
          vigor: { coste: 2, sobreescribe: { acrobacias: 1 } }, // acrobacias belongs to atleticas
        },
      }),
      "acrobacias does not belong to vigor group",
    );
  });

  it("accepts bonificadores_innatos with values", () => {
    assertValid(CategoryRuleDefinitionSchema.safeParse({
      ...validCategory,
      bonificadores_innatos: {
        primarias:   { habilidad_ataque: 5 },
        secundarias: { acrobacias: 10, saltar: 10 },
      },
    }));
  });

  it("fails when a bonificador is not a valid primarias skill", () => {
    assertInvalid(
      CategoryRuleDefinitionSchema.safeParse({
        ...validCategory,
        bonificadores_innatos: {
          primarias:   { otro: 2 },
          secundarias: {  },
        },
      }),
      "otro is not a valid member of primarias",
    );
  });

  it("fails when a bonificador is not a valid secundarias skill", () => {
    assertInvalid(
      CategoryRuleDefinitionSchema.safeParse({
        ...validCategory,
        bonificadores_innatos: {
          primarias:   {  },
          secundarias: { otro: 2 },
        },
      }),
      "otro is not a valid member of secundarias",
    );
  });

  it("fails when a bonificador is negative", () => {
    assertInvalid(
      CategoryRuleDefinitionSchema.safeParse({
        ...validCategory,
        bonificadores_innatos: {
          primarias:   {},
          secundarias: { acrobacias: -5 },
        },
      }),
      "bonificador must be non-negative",
    );
  });
});

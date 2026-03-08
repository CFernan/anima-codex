import { describe, it, expect } from "vitest";
import { AllCategoryDefinitionSchema } from "../../../src/lib/schema/category";
import { defaultCategories } from "../../../src/lib/data/defaultCategories";

describe("defaultCategories", () => {
  it("passes AllCategoryDefinitionSchema validation", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
  });

  it("contains all 20 official categories", () => {
    expect(Object.keys(defaultCategories)).toHaveLength(20);
  });

  // --- Arquetipos ---

  it("Guerrero has arquetipo Luchador only", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data["Guerrero"].arquetipos).toEqual(["Luchador"]);
    }
  });

  it("Novel has no arquetipos", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data["Novel"].arquetipos).toEqual([]);
    }
  });

  it("Tao has Domine and Luchador arquetipos", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data["Tao"].arquetipos).toContain("Domine");
      expect(result.data["Tao"].arquetipos).toContain("Luchador");
    }
  });

  it("Hechicero Mentalista has Místico and Psíquico arquetipos", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data["Hechicero Mentalista"].arquetipos).toContain("Místico");
      expect(result.data["Hechicero Mentalista"].arquetipos).toContain("Psíquico");
    }
  });

  it("Ladrón has arquetipo Acechador only", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data["Ladrón"].arquetipos).toEqual(["Acechador"]);
    }
  });

  // --- Limits ---

  it("all limite_* values are between 0 and 1", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      for (const [, cat] of Object.entries(result.data)) {
        expect(cat.limite_combate).toBeGreaterThanOrEqual(0);
        expect(cat.limite_combate).toBeLessThanOrEqual(1);
        expect(cat.limite_magia).toBeGreaterThanOrEqual(0);
        expect(cat.limite_magia).toBeLessThanOrEqual(1);
        expect(cat.limite_psi).toBeGreaterThanOrEqual(0);
        expect(cat.limite_psi).toBeLessThanOrEqual(1);
      }
    }
  });

  it("Hechicero has limite_magia of 0.6", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data["Hechicero"].limite_magia).toBe(0.6);
    }
  });

  it("Mentalista has limite_psi of 0.6", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data["Mentalista"].limite_psi).toBe(0.6);
    }
  });

  it("Novel has all limites at 0.6", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data["Novel"].limite_combate).toBe(0.6);
      expect(result.data["Novel"].limite_magia).toBe(0.6);
      expect(result.data["Novel"].limite_psi).toBe(0.6);
    }
  });

  // --- PV and turno ---

  it("all categories have positive coste_multiplo_pv", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      for (const [, cat] of Object.entries(result.data)) {
        expect(cat.coste_multiplo_pv).toBeGreaterThan(0);
      }
    }
  });

  it("Maestro en Armas has coste_multiplo_pv of 10", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data["Maestro en Armas"].coste_multiplo_pv).toBe(10);
    }
  });

  // --- Combat costs ---

  it("all combat costs are between 1 and 3", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      for (const [, cat] of Object.entries(result.data)) {
        for (const cost of Object.values(cat.combate)) {
          expect(cost).toBeGreaterThanOrEqual(1);
          expect(cost).toBeLessThanOrEqual(3);
        }
      }
    }
  });

  it("Maestro en Armas has llevar_armadura cost of 1", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data["Maestro en Armas"].combate.llevar_armadura).toBe(1);
    }
  });

  it("Hechicero has habilidad_ataque cost of 3", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data["Hechicero"].combate.habilidad_ataque).toBe(3);
    }
  });

  // --- Secondary overrides ---

  it("Guerrero has p_fuerza override cost of 1 in vigor", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data["Guerrero"].secundarias.vigor.overrides?.p_fuerza).toBe(1);
    }
  });

  it("Hechicero has v_magica override cost of 1 in intelectuales", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data["Hechicero"].secundarias.intelectuales.overrides?.v_magica).toBe(1);
    }
  });

  it("Explorador has animales override cost of 1 in intelectuales", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data["Explorador"].secundarias.intelectuales.overrides?.animales).toBe(1);
    }
  });

  it("Asesino has sigilo override cost of 1 in subterfugio", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data["Asesino"].secundarias.subterfugio.overrides?.sigilo).toBe(1);
    }
  });

  it("Ilusionista has persuasion override cost of 1 in sociales", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data["Ilusionista"].secundarias.sociales.overrides?.persuasion).toBe(1);
    }
  });

  it("Conjurador has ocultismo override cost of 1 in intelectuales", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data["Conjurador"].secundarias.intelectuales.overrides?.ocultismo).toBe(1);
    }
  });

  // --- Bonificadores innatos ---

  it("Guerrero Acróbata has acrobacias secondary bonus of 10", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data["Guerrero Acróbata"].bonificadores_innatos.secundarias.acrobacias).toBe(10);
    }
  });

  it("Explorador has advertir secondary bonus of 10", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data["Explorador"].bonificadores_innatos.secundarias.advertir).toBe(10);
    }
  });

  it("Guerrero has habilidad_ataque primary bonus of 5", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data["Guerrero"].bonificadores_innatos.primarias.habilidad_ataque).toBe(5);
    }
  });

  it("Novel has no bonificadores innatos", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Object.keys(result.data["Novel"].bonificadores_innatos.primarias)).toHaveLength(0);
      expect(Object.keys(result.data["Novel"].bonificadores_innatos.secundarias)).toHaveLength(0);
    }
  });

  it("Mentalista has no bonificadores innatos", () => {
    const result = AllCategoryDefinitionSchema.safeParse(defaultCategories);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Object.keys(result.data["Mentalista"].bonificadores_innatos.primarias)).toHaveLength(0);
      expect(Object.keys(result.data["Mentalista"].bonificadores_innatos.secundarias)).toHaveLength(0);
    }
  });
});

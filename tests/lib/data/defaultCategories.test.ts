import { describe, it, expect } from "vitest";
import { z } from "zod";
import { AllCategoryDefinitionSchema } from "../../../src/lib/schema/category";
import { CombatSkillsInvestmentSchema } from "../../../src/lib/schema/combat";
import { SecondarySkillsInvestmentSchema } from "../../../src/lib/schema/secondary";
import { defaultCategories } from "../../../src/lib/data/defaultCategories";

// ---------------------------------------------------------------------------
// Derive valid keys from schemas — stays in sync automatically
// ---------------------------------------------------------------------------

const VALID_COMBAT_KEYS = new Set(Object.keys(CombatSkillsInvestmentSchema.shape));

const VALID_SECONDARY_GROUPS: Record<string, Set<string>> = Object.fromEntries(
  Object.entries(SecondarySkillsInvestmentSchema.shape).map(([group, schema]) => [
    group,
    new Set(
      Object.keys((schema as z.ZodObject<z.ZodRawShape>).shape)
        .filter(k => k !== "custom")
    ),
  ])
);

const VALID_SECONDARY_KEYS = new Set(
  Object.values(VALID_SECONDARY_GROUPS).flatMap(keys => [...keys])
);

// ---------------------------------------------------------------------------
// Parse once and share across all tests
// ---------------------------------------------------------------------------

const parsed = AllCategoryDefinitionSchema.safeParse(defaultCategories);

describe("defaultCategories — structural invariants", () => {
  it("passes full schema validation", () => {
    if (!parsed.success) {
      const errors = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("\n");
      expect.fail(`Schema validation failed:\n${errors}`);
    }
    expect(parsed.success).toBe(true);
  });

  it("every category has all 7 secondary groups", () => {
    if (!parsed.success) return;
    for (const [name, cat] of Object.entries(parsed.data)) {
      const groups = new Set(Object.keys(cat.secundarias));
      for (const g of Object.keys(VALID_SECONDARY_GROUPS)) {
        expect(groups, `"${name}" is missing secondary group "${g}"`).toContain(g);
      }
    }
  });

  it("no override has the same value as its group coste (redundant override)", () => {
    if (!parsed.success) return;
    for (const [name, cat] of Object.entries(parsed.data)) {
      for (const [group, sg] of Object.entries(cat.secundarias)) {
        if (!sg.overrides) continue;
        for (const [skill, cost] of Object.entries(sg.overrides)) {
          expect(
            cost,
            `"${name}" › ${group} › ${skill}: override cost equals group cost (redundant)`
          ).not.toBe(sg.coste);
        }
      }
    }
  });

  it("no category has duplicate arquetipos", () => {
    if (!parsed.success) return;
    for (const [name, cat] of Object.entries(parsed.data)) {
      const unique = new Set(cat.arquetipos);
      expect(
        unique.size,
        `"${name}" has duplicate arquetipos`
      ).toBe(cat.arquetipos.length);
    }
  });

  it("bonificadores_innatos.primarias only references valid combat skill keys", () => {
    if (!parsed.success) return;
    for (const [name, cat] of Object.entries(parsed.data)) {
      for (const key of Object.keys(cat.bonificadores_innatos.primarias)) {
        expect(
          VALID_COMBAT_KEYS,
          `"${name}" › bonificadores_innatos.primarias has unknown key "${key}"`
        ).toContain(key);
      }
    }
  });

  it("bonificadores_innatos.secundarias only references valid secondary skill keys", () => {
    if (!parsed.success) return;
    for (const [name, cat] of Object.entries(parsed.data)) {
      for (const key of Object.keys(cat.bonificadores_innatos.secundarias)) {
        expect(
          VALID_SECONDARY_KEYS,
          `"${name}" › bonificadores_innatos.secundarias has unknown key "${key}"`
        ).toContain(key);
      }
    }
  });

  it("secondary overrides only reference valid skill keys for their group", () => {
    if (!parsed.success) return;
    for (const [name, cat] of Object.entries(parsed.data)) {
      for (const [group, sg] of Object.entries(cat.secundarias)) {
        if (!sg.overrides) continue;
        const validKeys = VALID_SECONDARY_GROUPS[group];
        for (const key of Object.keys(sg.overrides)) {
          expect(
            validKeys,
            `"${name}" › ${group}: override key "${key}" does not belong to this group`
          ).toContain(key);
        }
      }
    }
  });

  it("all bonificadores_innatos values are multiples of 5", () => {
    if (!parsed.success) return;
    for (const [name, cat] of Object.entries(parsed.data)) {
      for (const [key, val] of Object.entries(cat.bonificadores_innatos.primarias)) {
        expect(val % 5, `"${name}" › primarias › ${key}: ${val} is not a multiple of 5`).toBe(0);
      }
      for (const [key, val] of Object.entries(cat.bonificadores_innatos.secundarias)) {
        expect(val % 5, `"${name}" › secundarias › ${key}: ${val} is not a multiple of 5`).toBe(0);
      }
    }
  });
});

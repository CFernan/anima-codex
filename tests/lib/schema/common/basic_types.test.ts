import { describe, it } from "vitest";
import { AtributoFlexibleSchema } from "$lib/schema/common/basic_types";
import { assertValid, assertInvalid, autoLabels } from "../../helpers/test-helpers";


// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const mod = (fuente: string, descripcion?: string) =>
  ({ fuente, valor: 0, ...(descripcion !== undefined ? { descripcion } : {}) });

// One entry per AtributoFlexible variant to parametrize duplicate checks
const withBase      =   (mods: object[]) => ({ base: 5, modificadores_base: mods });
const withPD        =   (mods: object[]) => ({ pd: 10,  modificadores_base: mods });
const withDerived   =   (mods: object[]) => ({          modificadores_base: mods });

const withTempBase  =   (mods: object[]) => ({ base: 5, modificadores_temporales: mods });
const withTempPD    =   (mods: object[]) => ({ pd: 10,  modificadores_temporales: mods });
const withTempDerived = (mods: object[]) => ({          modificadores_temporales: mods });


// ===========================================================================
// modificadores_base — unique fuente+descripcion
// ===========================================================================

describe("AtributoFlexibleSchema — modificadores_base uniqueness", () => {

  describe("accepts unique fuente+descripcion combinations", () => {
    it.each(autoLabels([
      [ { AtributoFlexibleSchema }, { desc: "different fuente, no descripcion",
          input: withBase(
            [ mod("Hechizo"),
              mod("Equipo")])}],
      [ { AtributoFlexibleSchema }, { desc: "same fuente, different descripcion",
          input: withBase(
            [ mod("Hechizo", "A"),
              mod("Hechizo", "B")])}],
      [ { AtributoFlexibleSchema }, { desc: "same fuente, one with descripcion one without",
          input: withBase(
            [ mod("Hechizo"),
              mod("Hechizo", "extra")])}],
      [ { AtributoFlexibleSchema }, { desc: "PD variant — different fuente",
          input: withPD(
            [ mod("Otro"),
              mod("Equipo")])}],
      [ { AtributoFlexibleSchema }, { desc: "Derived variant — same fuente, diff descripcion",
          input: withDerived(
            [ mod("Bendición", "A"),
              mod("Bendición", "B")])}],
      [ { AtributoFlexibleSchema }, { desc: "empty array",
          input: withBase(
            [])}],
      [ { AtributoFlexibleSchema }, { desc: "single modifier",
          input: withBase(
            [ mod("Hechizo")])}],
    ]))("$desc", ({ schema, input }) => assertValid(schema.safeParse(input)));
  });

  describe("rejects duplicate fuente+descripcion", () => {
    it.each(autoLabels([
      [ { AtributoFlexibleSchema }, { desc: "same fuente, no descripcion (both undefined)",
          input: withBase(
            [ mod("Raza"),
              mod("Raza")]), }],
      [ { AtributoFlexibleSchema }, { desc: "same fuente and same descripcion",
          input: withBase(
            [ mod("Raza", "A"),
              mod("Raza", "A")]), }],
      [ { AtributoFlexibleSchema }, { desc: "PD variant — duplicate fuente",
          input: withPD(
            [ mod("Categoria"),
              mod("Categoria")]), }],
      [ { AtributoFlexibleSchema }, { desc: "Derived variant — duplicate fuente+descripcion",
          input: withDerived(
            [ mod("Motor", "X"),
              mod("Motor", "X")]), }],
      [ { AtributoFlexibleSchema }, { desc: "duplicate in three-element array",
          input: withBase(
            [ mod("A"),
              mod("B"),
              mod("A")]), }],
    ]))("$desc", ({ schema, input }) =>
      assertInvalid(schema.safeParse(input), "fuente+descripcion must be unique within modificadores_base"));
  });

});


// ===========================================================================
// modificadores_temporales — unique fuente+descripcion
// ===========================================================================

describe("AtributoFlexibleSchema — modificadores_temporales uniqueness", () => {

  describe("accepts unique fuente+descripcion combinations", () => {
    it.each(autoLabels([
      [ { AtributoFlexibleSchema }, { desc: "different fuente, no descripcion",
          input: withTempBase(
            [ mod("Hechizo"),
              mod("Buff")]), }],
      [ { AtributoFlexibleSchema }, { desc: "same fuente, different descripcion",
          input: withTempBase(
            [ mod("Hechizo", "A"),
              mod("Hechizo", "B")]), }],
      [ { AtributoFlexibleSchema }, { desc: "same fuente, one with descripcion one without",
          input: withTempPD(
            [ mod("Hechizo"),
              mod("Hechizo", "extra")]), }],
      [ { AtributoFlexibleSchema }, { desc: "empty array",
          input: withTempDerived(
            []), }],
    ]))("$desc", ({ schema, input }) => assertValid(schema.safeParse(input)));
  });

  describe("rejects duplicate fuente+descripcion", () => {
    it.each(autoLabels([
      [ { AtributoFlexibleSchema }, { desc: "same fuente, no descripcion",
          input: withTempBase(
            [ mod("Hechizo"),
              mod("Hechizo")]), }],
      [ { AtributoFlexibleSchema }, { desc: "same fuente and same descripcion",
          input: withTempBase(
            [ mod("Hechizo", "A"),
              mod("Hechizo", "A")]), }],
      [ { AtributoFlexibleSchema }, { desc: "PD variant — duplicate fuente",
          input: withTempPD(
            [ mod("Buff"),
              mod("Buff")]), }],
    ]))("$desc", ({ schema, input }) =>
      assertInvalid(schema.safeParse(input), "fuente+descripcion must be unique within modificadores_temporales"));
  });

});


// ===========================================================================
// Both arrays are independent — duplicates across arrays are allowed
// ===========================================================================

describe("AtributoFlexibleSchema — base and temporal arrays are independent", () => {
  it("same fuente+descripcion in base and temporal is valid", () =>
    assertValid(AtributoFlexibleSchema.safeParse({
      base:                     5,
      modificadores_base:       [mod("Raza")],
      modificadores_temporales: [mod("Raza")],   // duplicate across arrays — allowed
    })));
});

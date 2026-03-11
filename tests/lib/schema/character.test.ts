import { describe, it, expect } from "vitest";
import { CharacterSchema } from "$lib/schema/character";
import { assertValid, assertInvalid } from "../helpers/test-helpers";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const validModifier = { valor: 5, fuente: "Raza" };

const validDirectAttribute = { base: 10 };
const validDerivedAttribute = {};
const validDirectSecondary  = { base: 5 }; // apariencia is DirectAttribute
const validPDAttribute      = { pd: 0 };

const validCombat = {
  habilidad_ataque:  validPDAttribute,
  habilidad_parada:  validPDAttribute,
  habilidad_esquiva: validPDAttribute,
  llevar_armadura:   validPDAttribute,
};

const validSecundarias = {
  atleticas: {
    acrobacias: validPDAttribute, atletismo:  validPDAttribute, montar: validPDAttribute,
    nadar: validPDAttribute, trepar: validPDAttribute, saltar: validPDAttribute, pilotar: validPDAttribute,
  },
  sociales: {
    estilo: validPDAttribute, intimidar: validPDAttribute, liderazgo: validPDAttribute,
    persuasion: validPDAttribute, comercio: validPDAttribute, callejeo: validPDAttribute, etiqueta: validPDAttribute,
  },
  perceptivas: { advertir: validPDAttribute, buscar: validPDAttribute, rastrear: validPDAttribute },
  intelectuales: {
    animales: validPDAttribute, ciencia: validPDAttribute, ley: validPDAttribute, herbolaria: validPDAttribute,
    historia: validPDAttribute, tactica: validPDAttribute, medicina: validPDAttribute, memorizar: validPDAttribute,
    navegacion: validPDAttribute, ocultismo: validPDAttribute, tasacion: validPDAttribute, v_magica: validPDAttribute,
  },
  vigor: { frialdad: validPDAttribute, p_fuerza: validPDAttribute, res_dolor: validPDAttribute },
  subterfugio: {
    cerrajeria: validPDAttribute, disfraz: validPDAttribute, ocultarse: validPDAttribute, robo: validPDAttribute,
    sigilo: validPDAttribute, tramperia: validPDAttribute, venenos: validPDAttribute,
  },
  creativas: {
    arte: validPDAttribute, baile: validPDAttribute, forja: validPDAttribute, runas: validPDAttribute,
    alquimia: validPDAttribute, animismo: validPDAttribute, musica: validPDAttribute, t_manos: validPDAttribute,
    caligrafia_ritual: validPDAttribute, orfebreria: validPDAttribute, confeccion: validPDAttribute,
    conf_marionetas: validPDAttribute,
  },
};

// puntos_de_vida is PDAttributeSchema — only pd, no base.
const validCategory = {
  nombre:         "Guerrero",
  nivel:          1,
  combate:        validCombat,
  secundarias:    validSecundarias,
  puntos_de_vida: validPDAttribute,
};

const validCharacter = {
  schema_version: 1 as const,
  nombre:  "Kael",
  jugador: "Carlos",
  raza:    "Humano",
  categorias: [validCategory],
  caracteristicas_primarias: {
    agi: validDirectAttribute, con: validDirectAttribute, des: validDirectAttribute,
    fue: validDirectAttribute, int: validDirectAttribute, per: validDirectAttribute,
    pod: validDirectAttribute, vol: validDirectAttribute,
  },
  capacidades_fisicas: {
    tipo_de_movimiento: validDerivedAttribute,
    indice_de_peso:     validDerivedAttribute,
    cansancio:          validDerivedAttribute,
  },
  caracteristicas_secundarias: {
    apariencia: validDirectSecondary,
    tamaño:     validDerivedAttribute,
  },
  turno_base: validDerivedAttribute,
  resistencias: {
    presencia: validDerivedAttribute, rf: validDerivedAttribute, re: validDerivedAttribute,
    rv: validDerivedAttribute, rm: validDerivedAttribute, rp: validDerivedAttribute,
  },
  ventajas_y_desventajas: { total: 3, gastados: 0 },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CharacterSchema", () => {
  it("accepts a valid character", () => {
    assertValid(CharacterSchema.safeParse(validCharacter));
  });

  it("strips unknown fields", () => {
    const result = CharacterSchema.safeParse({ ...validCharacter, campo_desconocido: "valor" });
    assertValid(result);
    if (result.success) {
      expect((result.data as Record<string, unknown>).campo_desconocido).toBeUndefined();
    }
  });

  it("fails when schema_version is missing", () => {
    const { schema_version, ...rest } = validCharacter;
    assertInvalid(CharacterSchema.safeParse(rest), "schema_version is required");
  });

  it("fails when schema_version is wrong", () => {
    assertInvalid(
      CharacterSchema.safeParse({ ...validCharacter, schema_version: 2 }),
      "schema_version must be literal 1",
    );
  });

  it("fails when nombre is missing", () => {
    const { nombre, ...rest } = validCharacter;
    assertInvalid(CharacterSchema.safeParse(rest), "nombre is required");
  });

  it("fails when nombre is not a string", () => {
    assertInvalid(
      CharacterSchema.safeParse({ ...validCharacter, nombre: 42 }),
      "nombre must be a string",
    );
  });

  it("fails when categorias is empty", () => {
    assertInvalid(
      CharacterSchema.safeParse({ ...validCharacter, categorias: [] }),
      "categorias must have at least one entry",
    );
  });

  it("fails when categoria nivel is zero", () => {
    assertInvalid(
      CharacterSchema.safeParse({
        ...validCharacter,
        categorias: [{ ...validCategory, nivel: 0 }],
      }),
      "categoria nivel must be positive",
    );
  });

  it("fails when a primary characteristic base is negative", () => {
    assertInvalid(
      CharacterSchema.safeParse({
        ...validCharacter,
        caracteristicas_primarias: {
          ...validCharacter.caracteristicas_primarias,
          agi: { base: -1 },
        },
      }),
      "characteristic base must be non-negative",
    );
  });

  it("fails when a primary characteristic base is not an integer", () => {
    assertInvalid(
      CharacterSchema.safeParse({
        ...validCharacter,
        caracteristicas_primarias: {
          ...validCharacter.caracteristicas_primarias,
          agi: { base: 5.5 },
        },
      }),
      "characteristic base must be an integer",
    );
  });

  it("fails when pd is negative", () => {
    assertInvalid(
      CharacterSchema.safeParse({
        ...validCharacter,
        categorias: [{
          ...validCategory,
          combate: { ...validCombat, habilidad_ataque: { pd: -10 } },
        }],
      }),
      "pd must be non-negative",
    );
  });

  it("accepts optional trasfondo and notas", () => {
    assertValid(CharacterSchema.safeParse({
      ...validCharacter,
      trasfondo: "Un guerrero del norte.",
      notas: "Pendiente de revisar equipo.",
    }));
  });

  it("accepts a modifier with optional descriptor", () => {
    assertValid(CharacterSchema.safeParse({
      ...validCharacter,
      caracteristicas_primarias: {
        ...validCharacter.caracteristicas_primarias,
        agi: {
          base: 10,
          modificadores_base: [{ ...validModifier, descriptor: "Bonificador racial" }],
        },
      },
    }));
  });

  it("accepts multi-class character", () => {
    assertValid(CharacterSchema.safeParse({
      ...validCharacter,
      categorias: [validCategory, { ...validCategory, nombre: "Acróbata", nivel: 1 }],
    }));
  });
});

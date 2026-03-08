import { z } from "zod";

// ---------------------------------------------------------------------------
// Primary characteristics enum
// Used across schemas, engine formulas, and UI components.
// ---------------------------------------------------------------------------

export const CaracteristicaEnum = z.enum([
  "agi",
  "con",
  "des",
  "fue",
  "int",
  "per",
  "pod",
  "vol",
]);

export type Caracteristica = z.infer<typeof CaracteristicaEnum>;

// ---------------------------------------------------------------------------
// Armor penalty enum
// Describes how a skill is affected by worn armor and whether the
// penalty can be reduced via the llevar_armadura skill.
//
//   ninguno               — no penalty
//   reducible             — penalty can be fully eliminated via llevar_armadura
//   reducible_hasta_mitad — penalty can be reduced by at most half
//   no_reducible          — penalty cannot be reduced in any way
//   percepcion            — non-reducible penalty applied only to perceptive
//                           skills (advertir, buscar, rastrear)
// ---------------------------------------------------------------------------

export const PenalizadorArmaduraEnum = z.enum([
  "ninguno",
  "reducible",
  "reducible_hasta_mitad",
  "no_reducible",
  "percepcion",
]);

export type PenalizadorArmadura = z.infer<typeof PenalizadorArmaduraEnum>;

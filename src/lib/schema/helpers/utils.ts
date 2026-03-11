import { z } from "zod";

/**
 * Builds a z.object() whose keys are the values of a z.enum() and whose
 * values all share the same schema.
 *
 * Avoids duplicating enum literals when defining different schemas that
 * are all keyed by the same domain enum but have different value types.
 *
 * @example
 * const BasicCombatEnum = z.enum(["habilidad_ataque", "habilidad_parada"]);
 * const CombatInvestmentSchema  = recordFromEnum(BasicCombatEnum, PDAttributeSchema);
 * 
 * This generates the zod schema:
 *   z.object({
 *    habilidad_ataque:  PDAttributeSchema,
 *    habilidad_parada:  PDAttributeSchema,
 *   })
 */
export function schemaFromEnum<KEnum extends z.ZodEnum<any>, VType extends z.ZodTypeAny>(
  keyEnum: KEnum,
  valueSchema: VType,
): z.ZodObject<Record<z.infer<KEnum>, VType>> {
  const shape = Object.fromEntries(
    keyEnum.options.map(key => [key, valueSchema]),
  ) as Record<z.infer<KEnum>, VType>;
  return z.object(shape);
}

/**
 * Refine predicate: returns true if all values in the array are unique.
 *
 * Usage:
 *   z.array(SomeSchema).refine(uniqueValues(), { message: "values must be unique" })
 *
 * Optionally accepts a key extractor for arrays of objects:
 *   z.array(z.object({id: z.string()}))
 *     .refine(uniqueValues(x => x.id), { message: "ids must be unique" })
 */
export const uniqueValues = <T>(keyFn: (item: T) => unknown = (x) => x) =>
  (items: T[]): boolean => {
    const seen = new Set(items.map(keyFn));
    return seen.size === items.length;
  };
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


/**
 * Recursively unwraps Zod "wrapper" types to reach the underlying core schema.
 * Handles .optional(), .nullable(), .default(), and .refine()/.transform().
 * * @param current - The Zod schema type to unwrap.
 * @returns The underlying Zod schema as a generic ZodTypeAny.
 */
function unwrapZodType(wrapper: z.ZodTypeAny): z.ZodTypeAny {
  // .optional(), .nullable() and .default() have an unwrap() method
  if (
      wrapper instanceof z.ZodOptional ||
      wrapper instanceof z.ZodNullable ||
      wrapper instanceof z.ZodDefault
    ) {
    return unwrapZodType(wrapper.unwrap() as z.ZodTypeAny);
  }

  // If no more wrappers are found, we have reached the core schema
  return wrapper as z.ZodTypeAny;
}

/**
 * Navigates through a Zod schema using a '/' delimited path string.
 * * @description
 * This function is the core of the dynamic form engine. It resolves a string path
 * into its corresponding Zod sub-schema.
 * * Key behaviors:
 * 1. **Metadata Preservation**: If the path is empty, it returns the schema with
 *      all modifiers (optional, default, etc.) intact.
 * 2. **Recursive Navigation**: Peels modifiers only when moving to the next level.
 * 3. **Array Support**: Uses '[]' as a dedicated segment to enter array elements.
 * * @param schema - The Zod schema to traverse.
 * @param path - A slash-separated path (e.g., "/stats/skills/[]/level").
 * @returns The ZodType at the path, or undefined if the path is invalid.
 * * @example
 *   const schema = z.object({
 *     user: z.object({
 *       tags: z.array(z.object({
 *         name: z.string().optional()
 *       }))
 *     })
 *   })
 *
 *   Path: "/user/tags"
 *   1. Navigates to 'user' (z.object)
 *   2. Returns 'tags' schema (z.array)
 *
 *   Path: "/user/tags/[]"
 *   1. Navigates to 'user' (z.object)
 *   2. Navigates to 'tags' (z.array)
 *   3. Returns array elements schema (z.object)
 *
 *   Path: "/user/tags/[]/name"
 *   1. Navigates to 'user' (z.object)
 *   2. Navigates to 'tags' (z.array)
 *   3. Navigates to through array elements (z.object)
 *   4. Returns 'name' schema with modifiers (z.string.optional)
 *
 *   Path: "/user/tags/[]/name/"
 *   1. Navigates to 'user' (z.object)
 *   2. Navigates to 'tags' (z.array)
 *   3. Navigates to through array elements (z.object)
 *   4. Returns 'name' peeled schema without modifiers (z.string)
 */
export function getSubSchemaFromPath(schema: z.ZodTypeAny, path: string): any {
  if (!schema) return undefined;

  // Exit if no more nesting
  if (path.length === 0) return schema

  // Peel modifiers (optional, default, nullable, etc.)
  schema = unwrapZodType(schema);

  // If path is just "/" return peeled schema
  if (path === "/") return schema

  // Get currentPath and remainingPath
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const separatorIndex = cleanPath.indexOf('/');
  const currentPath = separatorIndex !== -1 ? cleanPath.slice(0, separatorIndex) : cleanPath;
  const remainingPath = separatorIndex !== -1 ? cleanPath.slice(separatorIndex) : "";

  // CASE: Standard Object Navigation
  if (schema instanceof z.ZodObject) {
    return getSubSchemaFromPath(schema.shape[currentPath], remainingPath);
  }
  // CASE: Array Navigation
  else if (schema instanceof z.ZodArray) {
    // Dereferencing array with "[]" (e.g. basic_array/[])
    if (currentPath !== "[]") return undefined

    return getSubSchemaFromPath(schema.element as z.ZodTypeAny, remainingPath);
  }

  return undefined;
}

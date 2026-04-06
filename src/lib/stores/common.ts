import type z from "zod";
import { AcxSchema } from "$lib/schema/acx/acx";
import { getSubSchemaFromPath } from "$lib/schema/common/utils";

export function getSubSchemaFromAcxPath(path: string): any {
  return getSubSchemaFromPath(AcxSchema, path);
}

import { describe, it } from "vitest";
import { readdirSync, readFileSync } from "fs";
import { resolve } from "path";
import { CharacterSchema } from "$lib/schema/acx/character";
import { assertValid } from "../../helpers/test-helpers";

const EXAMPLES_DIR = resolve(__dirname, "../../../../examples");

const acxFiles = readdirSync(EXAMPLES_DIR)
  .filter(f => f.endsWith(".acx"))
  .map(f => ({ filename: f, path: resolve(EXAMPLES_DIR, f) }));

describe("examples/ — all .acx files pass CharacterSchema", () => {
  it.each(acxFiles)("$filename", ({ path }) => {
    const raw = JSON.parse(readFileSync(path, "utf-8"));
    assertValid(CharacterSchema.safeParse(raw));
  });
});

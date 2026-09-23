import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";
import prettier from "prettier";

const schema = new URL("../contracts/openapi.json", import.meta.url);
const output = new URL("../src/api/generated/openapi.ts", import.meta.url);
const config = await prettier.resolveConfig(fileURLToPath(output));
const generated = await prettier.format(astToString(await openapiTS(schema)), {
    ...config,
    parser: "typescript",
});
if (process.argv.includes("--check")) {
    const current = await readFile(output, "utf8");
    if (current !== generated) {
        console.error(
            "Generated API types are stale. Run make api-generate and commit the result.",
        );
        process.exitCode = 1;
    } else {
        console.log("Generated API types match the pinned contract.");
    }
} else {
    await writeFile(output, generated);
    console.log("Generated API types from contracts/openapi.json.");
}

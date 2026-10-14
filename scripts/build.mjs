import { cp, mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "build", "extension");
const manifest = JSON.parse(await readFile(path.join(projectRoot, "manifest.json"), "utf8"));

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

for (const entry of ["manifest.json", "background.js", "dist", "icons"]) {
  await cp(path.join(projectRoot, entry), path.join(outputRoot, entry), { recursive: true });
}

console.log(`Built ${manifest.name} v${manifest.version} at ${outputRoot}`);

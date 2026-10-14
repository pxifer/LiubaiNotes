import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

test("browser JavaScript files parse without syntax errors", async () => {
  for (const file of ["background.js", "dist/app.js", "docs/site-config.js", "docs/site.js"]) {
    const source = await read(file);
    assert.doesNotThrow(() => new Function(source), `${file} has a syntax error`);
  }
});

test("manifest is minimal Microsoft Edge Manifest V3", async () => {
  const manifest = JSON.parse(await read("manifest.json"));
  assert.equal(manifest.manifest_version, 3);
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  assert.deepEqual(manifest.permissions, []);
  assert.equal(manifest.background.service_worker, "background.js");
});

test("all manifest files exist", async () => {
  const manifest = JSON.parse(await read("manifest.json"));
  const paths = [
    manifest.background.service_worker,
    ...Object.values(manifest.icons),
    ...Object.values(manifest.action.default_icon),
    "dist/index.html",
    "dist/styles.css",
    "dist/app.js"
  ];
  await Promise.all([...new Set(paths)].map((relativePath) => access(path.join(root, relativePath))));
});

test("core note behaviors remain wired", async () => {
  const app = await read("dist/app.js");
  for (const marker of ["createNote", "updateCurrentNote", "deleteCurrentNote", "togglePin", "filteredNotes", "localStorage.setItem"]) {
    assert.match(app, new RegExp(marker));
  }
  assert.match(app, /AUTOSAVE_DELAY\s*=\s*260/);
});

test("website uses repository-subpath-safe links", async () => {
  const htmlFiles = ["docs/index.html", "docs/privacy.html"];
  for (const file of htmlFiles) {
    const html = await read(file);
    const rootAbsolute = [...html.matchAll(/(?:href|src)=["']\/(?!\/)/g)];
    assert.equal(rootAbsolute.length, 0, `${file} contains root-absolute asset links`);
  }
  const homepage = await read("docs/index.html");
  assert.match(homepage, /\.\/downloads\/liubai-notes-edge-v1\.0\.0\.zip/);
});

test("no sensitive or debug files are present in the project tree", async () => {
  const blocked = /^(?:\.env(?:\..*)?|.*\.log|.*\.map|id_rsa|.*\.(?:pem|key|p12|pfx))$/i;
  const ignoredFolders = new Set([".git", "build", "release", "node_modules"]);
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (ignoredFolders.has(entry.name)) continue;
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(fullPath);
      else assert.doesNotMatch(entry.name, blocked, `blocked file found: ${fullPath}`);
    }
  }
  await walk(root);
});

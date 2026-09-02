#!/usr/bin/env node
// @ts-check

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const validator = fileURLToPath(new URL("./validate-tidio-output.mjs", import.meta.url));
const root = await mkdtemp(join(tmpdir(), "b2b-tidio-validator-"));

/** @param {string} path @param {string} content */
async function put(path, content) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf8");
}

/** @param {string[]} argumentsList @returns {{ status: number | null, stdout: string, stderr: string }} */
function run(argumentsList) {
  const result = spawnSync(process.execPath, [validator, ...argumentsList, "--json"], { encoding: "utf8" });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

const key = "customerpublickey123";
const loader = `<script src="https://code.tidio.co/${key}.js" async></script>`;

try {
  const dist = join(root, "dist");
  const routes = join(root, "routes.json");
  const enabled = join(root, "enabled.json");
  const disabled = join(root, "disabled.json");

  await put(join(dist, "index.html"), `<html><body>${loader}</body></html>`);
  await put(join(dist, "products/index.html"), `<html><body>${loader}</body></html>`);
  await put(join(dist, "thank-you/index.html"), "<html><body>Thanks</body></html>");
  await put(routes, JSON.stringify(["/", "/products/", "/thank-you/"]));
  await put(enabled, JSON.stringify({ enabled: true, publicKey: key, includeRoutes: [], excludeRoutes: ["/thank-you/"] }));
  await put(disabled, JSON.stringify({ enabled: false, publicKey: null, includeRoutes: [], excludeRoutes: [] }));

  const enabledResult = run([dist, routes, enabled]);
  assert.equal(enabledResult.status, 0, enabledResult.stdout || enabledResult.stderr);

  const disabledResult = run([dist, routes, disabled]);
  assert.equal(disabledResult.status, 1, "disabled config must reject loaders left in output");
  assert.match(disabledResult.stdout, /tidio-unexpected/);

  await put(join(dist, "products/index.html"), "<html><body>No widget</body></html>");
  const missingResult = run([dist, routes, enabled]);
  assert.equal(missingResult.status, 1, "enabled target route must contain the loader");
  assert.match(missingResult.stdout, /tidio-count/);

  await put(join(dist, "products/index.html"), `<html><body><script src="https://code.tidio.co/wrongkey.js" async></script></body></html>`);
  const wrongKeyResult = run([dist, routes, enabled]);
  assert.equal(wrongKeyResult.status, 1, "a different project's key must fail");
  assert.match(wrongKeyResult.stdout, /tidio-key/);

  process.stdout.write("PASS: Tidio output validator tests completed.\n");
} finally {
  await rm(root, { recursive: true, force: true });
}

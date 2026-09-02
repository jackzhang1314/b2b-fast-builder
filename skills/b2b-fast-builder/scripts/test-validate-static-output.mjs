#!/usr/bin/env node
// @ts-check

import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const validator = fileURLToPath(new URL("./validate-static-output.mjs", import.meta.url));
const fixtureRoot = await mkdtemp(join(tmpdir(), "b2b-static-validator-"));

/**
 * @param {string} path
 * @param {string} content
 */
async function put(path, content) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, "utf8");
}

/**
 * @param {{ title: string, canonical: string, noindex?: boolean }} input
 * @returns {string}
 */
function page(input) {
  const robots = input.noindex ? '<meta name="robots" content="noindex, follow">' : "";
  return `<!doctype html><html lang="en"><head><title>${input.title}</title><meta name="description" content="A sufficiently detailed description for this generated B2B page."><link rel="canonical" href="${input.canonical}">${robots}</head><body><h1>${input.title}</h1><p>${"Useful product information for international buyers. ".repeat(4)}</p><a href="/products/">Products</a></body></html>`;
}

/**
 * @param {string[]} argumentsList
 * @returns {{ status: number | null, stdout: string, stderr: string }}
 */
function run(argumentsList) {
  const result = spawnSync(process.execPath, [validator, ...argumentsList, "--json"], { encoding: "utf8" });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

try {
  const good = join(fixtureRoot, "good");
  const goodDist = join(good, "dist");
  const goodRoutes = join(good, "routes.json");
  await put(join(goodDist, "index.html"), page({ title: "Excavator Manufacturer", canonical: "https://example.com/" }));
  await put(join(goodDist, "products/index.html"), page({ title: "Excavator Products", canonical: "https://example.com/products/" }));
  await put(join(goodDist, "thank-you/index.html"), page({ title: "Thank You", canonical: "https://example.com/thank-you/", noindex: true }));
  await put(join(goodDist, "404.html"), page({ title: "Page Not Found", canonical: "https://example.com/404/", noindex: true }));
  await put(join(goodDist, "robots.txt"), "User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml\n");
  await put(join(goodDist, "sitemap.xml"), '<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://example.com/</loc></url><url><loc>https://example.com/products/</loc></url></urlset>');
  await put(goodRoutes, JSON.stringify(["/", "/products/", "/thank-you/"]));

  const goodResult = run([goodDist, goodRoutes]);
  assert.equal(goodResult.status, 0, goodResult.stdout || goodResult.stderr);

  const missingManifestResult = run([goodDist]);
  assert.equal(missingManifestResult.status, 2, "route manifest must be mandatory");

  const spa = join(fixtureRoot, "spa");
  const spaDist = join(spa, "dist");
  const spaRoutes = join(spa, "routes.json");
  await put(join(spaDist, "index.html"), page({ title: "Only Home Exists", canonical: "https://example.com/" }));
  await put(join(spaDist, "404.html"), page({ title: "Page Not Found", canonical: "https://example.com/404/", noindex: true }));
  await put(join(spaDist, "robots.txt"), "Sitemap: https://example.com/sitemap.xml\n");
  await put(join(spaDist, "sitemap.xml"), '<?xml version="1.0"?><urlset><url><loc>https://example.com/</loc></url></urlset>');
  await put(spaRoutes, JSON.stringify(["/", "/products/"]));

  const spaResult = run([spaDist, spaRoutes]);
  assert.equal(spaResult.status, 1, "missing per-route HTML must fail");
  assert.match(spaResult.stdout, /route-output/);

  const duplicate = join(fixtureRoot, "duplicate");
  const duplicateDist = join(duplicate, "dist");
  const duplicateRoutes = join(duplicate, "routes.json");
  await put(join(duplicateDist, "index.html"), page({ title: "Same Title", canonical: "https://example.com/" }));
  await put(join(duplicateDist, "products/index.html"), page({ title: "Same Title", canonical: "https://example.com/products/" }));
  await put(join(duplicateDist, "404.html"), page({ title: "Page Not Found", canonical: "https://example.com/404/", noindex: true }));
  await put(join(duplicateDist, "robots.txt"), "Sitemap: https://example.com/sitemap.xml\n");
  await put(join(duplicateDist, "sitemap.xml"), '<?xml version="1.0"?><urlset><url><loc>https://example.com/</loc></url><url><loc>https://example.com/not-generated/</loc></url></urlset>');
  await put(duplicateRoutes, JSON.stringify(["/", "/products/"]));

  const duplicateResult = run([duplicateDist, duplicateRoutes]);
  assert.equal(duplicateResult.status, 1, "duplicate titles and sitemap mismatch must fail");
  assert.match(duplicateResult.stdout, /title-duplicate/);
  assert.match(duplicateResult.stdout, /sitemap-unexpected/);
  assert.match(duplicateResult.stdout, /sitemap-missing/);

  const unsafeRoutes = join(good, "unsafe-routes.json");
  await put(unsafeRoutes, JSON.stringify(["/", "/../outside/"]));
  const unsafeResult = run([goodDist, unsafeRoutes]);
  assert.equal(unsafeResult.status, 1, "unsafe route manifest entries must fail");
  assert.match(unsafeResult.stdout, /route-format/);
  assert.doesNotMatch(unsafeResult.stdout, /outside\/index\.html/);

  process.stdout.write("PASS: static output validator tests completed.\n");
} finally {
  await rm(fixtureRoot, { recursive: true, force: true });
}

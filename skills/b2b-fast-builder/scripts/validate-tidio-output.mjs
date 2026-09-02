#!/usr/bin/env node
// @ts-check

import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const jsonOutput = args.includes("--json");
const positional = args.filter((arg) => !arg.startsWith("--"));

if (positional.length !== 3) {
  process.stderr.write("Usage: node validate-tidio-output.mjs <output-dir> <routes.json> <tidio.json> [--json]\n");
  process.exit(2);
}

const outputDir = resolve(positional[0]);
const routesPath = resolve(positional[1]);
const configPath = resolve(positional[2]);

/** @typedef {{ enabled: boolean, publicKey: string | null, includeRoutes: string[], excludeRoutes: string[] }} TidioConfig */
/** @typedef {{ route: string, rule: string, message: string }} Finding */

/** @param {unknown} value @returns {value is Record<string, unknown>} */
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** @param {unknown} value @returns {string[]} */
function stringArray(value) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error("Expected a string array in Tidio configuration.");
  }
  return value;
}

/** @param {string} path @returns {Promise<boolean>} */
async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

/** @param {string} route @returns {string[]} */
function routeCandidates(route) {
  const clean = route.replace(/^\/+|\/+$/g, "");
  if (clean === "") return [join(outputDir, "index.html")];
  return [join(outputDir, clean, "index.html"), join(outputDir, `${clean}.html`)];
}

/** @param {string} tag @param {string} name @returns {string | null} */
function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match?.[2]?.trim() ?? null;
}

/** @param {string} src @returns {boolean} */
function hasTidioHostname(src) {
  try {
    return /(^|\.)tidio\.co$/i.test(new URL(src, "https://example.invalid").hostname);
  } catch {
    return false;
  }
}

/** @param {string} html @returns {{ tag: string, src: string }[]} */
function tidioScripts(html) {
  return (html.match(/<script\b[^>]*>/gi) ?? [])
    .map((tag) => ({ tag, src: attribute(tag, "src") }))
    .filter((item) => item.src !== null && hasTidioHostname(item.src))
    .map((item) => ({ tag: item.tag, src: item.src ?? "" }));
}

/** @returns {Promise<string[]>} */
async function readRoutes() {
  const parsed = JSON.parse(await readFile(routesPath, "utf8"));
  const routes = Array.isArray(parsed) ? parsed : isRecord(parsed) ? parsed.routes : null;
  if (!Array.isArray(routes) || !routes.every((item) => typeof item === "string") || routes.length === 0) {
    throw new Error("Route manifest must be a non-empty string array or an object with a string routes array.");
  }
  return routes;
}

/** @returns {Promise<TidioConfig>} */
async function readConfig() {
  const parsed = JSON.parse(await readFile(configPath, "utf8"));
  if (!isRecord(parsed) || typeof parsed.enabled !== "boolean") {
    throw new Error("Tidio configuration must contain a boolean enabled field.");
  }
  const publicKey = parsed.publicKey === null ? null : typeof parsed.publicKey === "string" ? parsed.publicKey : null;
  if (parsed.enabled && (!publicKey || !/^[a-z0-9]+$/i.test(publicKey))) {
    throw new Error("Enabled Tidio configuration requires an alphanumeric publicKey.");
  }
  return {
    enabled: parsed.enabled,
    publicKey,
    includeRoutes: stringArray(parsed.includeRoutes ?? []),
    excludeRoutes: stringArray(parsed.excludeRoutes ?? []),
  };
}

/** @param {string} route @param {TidioConfig} config @returns {boolean} */
function shouldContainTidio(route, config) {
  if (!config.enabled) return false;
  if (config.excludeRoutes.includes(route)) return false;
  return config.includeRoutes.length === 0 || config.includeRoutes.includes(route);
}

/** @type {Finding[]} */
const findings = [];

try {
  const [routes, config] = await Promise.all([readRoutes(), readConfig()]);
  const expectedSrc = config.publicKey ? `https://code.tidio.co/${config.publicKey}.js` : null;

  for (const configuredRoute of [...config.includeRoutes, ...config.excludeRoutes]) {
    if (!routes.includes(configuredRoute)) {
      findings.push({
        route: configuredRoute,
        rule: "tidio-route-config",
        message: "Configured Tidio route is missing from the route manifest.",
      });
    }
  }

  for (const route of routes) {
    const candidates = routeCandidates(route);
    const flags = await Promise.all(candidates.map(isFile));
    const index = flags.findIndex(Boolean);
    if (index < 0) {
      findings.push({ route, rule: "route-output", message: "Static HTML is missing; run the static validator first." });
      continue;
    }

    const scripts = tidioScripts(await readFile(candidates[index], "utf8"));
    const expected = shouldContainTidio(route, config);
    if (!expected && scripts.length > 0) {
      findings.push({ route, rule: "tidio-unexpected", message: "Tidio loader exists on a route where it is disabled or excluded." });
      continue;
    }
    if (expected && scripts.length !== 1) {
      findings.push({ route, rule: "tidio-count", message: `Expected exactly one Tidio loader, found ${scripts.length}.` });
      continue;
    }
    if (expected && scripts[0]) {
      if (scripts[0].src !== expectedSrc) {
        findings.push({ route, rule: "tidio-key", message: "Tidio loader does not use the configured customer Public Key and official HTTPS URL." });
      }
      if (!/\sasync(?:\s|=|>)/i.test(scripts[0].tag)) {
        findings.push({ route, rule: "tidio-async", message: "Tidio loader must retain the async attribute." });
      }
    }
  }

  const report = { outputDir, routes: routes.length, enabled: config.enabled, passed: findings.length === 0, findings };
  if (jsonOutput) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else if (report.passed) process.stdout.write(`PASS: Tidio configuration validated across ${routes.length} routes.\n`);
  else {
    process.stderr.write(`FAIL: ${findings.length} Tidio integration findings.\n`);
    for (const finding of findings) process.stderr.write(`- [${finding.rule}] ${finding.route}: ${finding.message}\n`);
  }
  process.exit(report.passed ? 0 : 1);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (jsonOutput) process.stdout.write(`${JSON.stringify({ outputDir, passed: false, error: message }, null, 2)}\n`);
  else process.stderr.write(`ERROR: ${message}\n`);
  process.exit(2);
}

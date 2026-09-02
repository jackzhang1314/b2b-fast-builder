#!/usr/bin/env node
// @ts-check

import { readFile, readdir, stat } from "node:fs/promises";
import { resolve, relative, join } from "node:path";

/** @typedef {{ file: string, rule: string, message: string }} Finding */

const args = process.argv.slice(2);

if (args.includes("--help") || args.length === 0) {
  process.stdout.write(
    "Usage: node validate-static-output.mjs <output-dir> [routes.json] [--json]\n" +
      "routes.json may be an array of routes or an object with a routes array.\n",
  );
  process.exit(args.includes("--help") ? 0 : 2);
}

const outputDir = resolve(args[0]);
const manifestArg = args.find((arg, index) => index > 0 && !arg.startsWith("--"));
const jsonOutput = args.includes("--json");

/**
 * @param {string} directory
 * @returns {Promise<string[]>}
 */
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? walk(path) : [path];
    }),
  );
  return nested.flat();
}

/**
 * @param {string} route
 * @returns {string[]}
 */
function routeCandidates(route) {
  const clean = route.split(/[?#]/, 1)[0].replace(/^\/+|\/+$/g, "");
  if (clean === "") return [join(outputDir, "index.html")];
  return [
    join(outputDir, clean, "index.html"),
    join(outputDir, `${clean}.html`),
  ];
}

/**
 * @param {string} html
 * @returns {string}
 */
function visibleText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @param {string} html
 * @param {string} file
 * @returns {Finding[]}
 */
function inspectHtml(html, file) {
  /** @type {Finding[]} */
  const findings = [];
  const add = (rule, message) => findings.push({ file, rule, message });

  if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(html)) {
    add("html-lang", "Missing a non-empty html[lang] attribute.");
  }
  if (!/<title\b[^>]*>\s*[^<]{3,}\s*<\/title>/i.test(html)) {
    add("title", "Missing or empty title element.");
  }
  if (!/<meta\b(?=[^>]*\bname=["']description["'])(?=[^>]*\bcontent=["'][^"']{20,}["'])[^>]*>/i.test(html)) {
    add("description", "Missing or too-short meta description.");
  }
  if (!/<link\b(?=[^>]*\brel=["']canonical["'])(?=[^>]*\bhref=["']https?:\/\/[^"']+["'])[^>]*>/i.test(html)) {
    add("canonical", "Missing absolute canonical link.");
  }
  if (!/<h1\b[^>]*>[\s\S]*?\S[\s\S]*?<\/h1>/i.test(html)) {
    add("h1", "Missing non-empty H1.");
  }
  if (!/<a\b[^>]*\bhref=["'][^"']+["']/i.test(html)) {
    add("crawlable-links", "No crawlable anchor with href found.");
  }

  const text = visibleText(html);
  if (text.length < 120) {
    add(
      "primary-content",
      `Only ${text.length} visible text characters found; page may be a client-rendered shell.`,
    );
  }

  const images = html.match(/<img\b[^>]*>/gi) ?? [];
  for (const image of images) {
    if (!/\balt=["'][^"']*["']/i.test(image)) {
      add("image-alt", "An img element is missing an alt attribute.");
      break;
    }
  }

  if (/\b(lorem ipsum|todo:|replace me|example product)\b/i.test(text)) {
    add("placeholder", "Placeholder content appears in visible page text.");
  }

  return findings;
}

/**
 * @param {string} path
 * @returns {Promise<boolean>}
 */
async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

/**
 * @param {string} manifestPath
 * @returns {Promise<string[]>}
 */
async function readRoutes(manifestPath) {
  const parsed = JSON.parse(await readFile(manifestPath, "utf8"));
  if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
    return parsed;
  }
  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "routes" in parsed &&
    Array.isArray(parsed.routes) &&
    parsed.routes.every((item) => typeof item === "string")
  ) {
    return parsed.routes;
  }
  throw new Error("Route manifest must be a string array or an object with a string routes array.");
}

/** @type {Finding[]} */
const findings = [];

try {
  if (!(await stat(outputDir)).isDirectory()) {
    throw new Error(`Not a directory: ${outputDir}`);
  }

  const files = await walk(outputDir);
  const htmlFiles = files.filter((file) => file.endsWith(".html"));

  if (htmlFiles.length === 0) {
    findings.push({ file: outputDir, rule: "html-files", message: "No HTML files found." });
  }

  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    findings.push(...inspectHtml(html, relative(outputDir, file)));
  }

  for (const required of ["robots.txt", "sitemap.xml", "404.html"]) {
    if (!(await isFile(join(outputDir, required)))) {
      findings.push({ file: required, rule: "required-file", message: `${required} is missing.` });
    }
  }

  if (manifestArg) {
    const routes = await readRoutes(resolve(manifestArg));
    for (const route of routes) {
      const candidates = routeCandidates(route);
      const matches = await Promise.all(candidates.map(isFile));
      if (!matches.some(Boolean)) {
        findings.push({
          file: route,
          rule: "route-output",
          message: `No static HTML found. Expected one of: ${candidates
            .map((candidate) => relative(outputDir, candidate))
            .join(", ")}`,
        });
      }
    }
  }

  const report = {
    outputDir,
    htmlFiles: htmlFiles.length,
    passed: findings.length === 0,
    findings,
  };

  if (jsonOutput) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else if (report.passed) {
    process.stdout.write(`PASS: ${htmlFiles.length} HTML files inspected in ${outputDir}.\n`);
  } else {
    process.stderr.write(`FAIL: ${findings.length} static-output findings.\n`);
    for (const finding of findings) {
      process.stderr.write(`- [${finding.rule}] ${finding.file}: ${finding.message}\n`);
    }
  }

  process.exit(report.passed ? 0 : 1);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (jsonOutput) {
    process.stdout.write(`${JSON.stringify({ outputDir, passed: false, error: message }, null, 2)}\n`);
  } else {
    process.stderr.write(`ERROR: ${message}\n`);
  }
  process.exit(2);
}

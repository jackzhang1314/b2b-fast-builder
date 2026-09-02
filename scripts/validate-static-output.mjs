#!/usr/bin/env node
// @ts-check

import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

/** @typedef {{ file: string, rule: string, message: string }} Finding */
/** @typedef {{ title: string | null, canonical: string | null, noindex: boolean }} PageSummary */

const args = process.argv.slice(2);
const jsonOutput = args.includes("--json");
const positional = args.filter((arg) => !arg.startsWith("--"));

function usage() {
  process.stdout.write(
    "Usage: node validate-static-output.mjs <output-dir> <routes.json> [--json]\n" +
      "routes.json must be a non-empty string array or an object with a string routes array.\n",
  );
}

if (args.includes("--help")) {
  usage();
  process.exit(0);
}

if (positional.length !== 2) {
  usage();
  process.exit(2);
}

const outputDir = resolve(positional[0]);
const routeManifestPath = resolve(positional[1]);

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
 * @param {string} pathname
 * @returns {string}
 */
function normalizePathname(pathname) {
  const collapsed = pathname.replace(/\/{2,}/g, "/");
  if (collapsed === "/") return "/";
  if (/\.[a-z0-9]+$/i.test(collapsed)) return collapsed;
  return collapsed.endsWith("/") ? collapsed : `${collapsed}/`;
}

/**
 * @param {string} route
 * @returns {string[]}
 */
function routeCandidates(route) {
  const clean = route.replace(/^\/+|\/+$/g, "");
  if (clean === "") return [join(outputDir, "index.html")];
  return [join(outputDir, clean, "index.html"), join(outputDir, `${clean}.html`)];
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
 * @param {string} tag
 * @param {string} name
 * @returns {string | null}
 */
function attribute(tag, name) {
  const pattern = new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i");
  return tag.match(pattern)?.[2]?.trim() ?? null;
}

/**
 * @param {string} html
 * @returns {string[]}
 */
function canonicalLinks(html) {
  return (html.match(/<link\b[^>]*>/gi) ?? [])
    .filter((tag) => (attribute(tag, "rel") ?? "").toLowerCase().split(/\s+/).includes("canonical"))
    .map((tag) => attribute(tag, "href"))
    .filter((href) => href !== null);
}

/**
 * @param {string} html
 * @returns {boolean}
 */
function hasNoindex(html) {
  return (html.match(/<meta\b[^>]*>/gi) ?? []).some((tag) => {
    const name = (attribute(tag, "name") ?? "").toLowerCase();
    const content = (attribute(tag, "content") ?? "").toLowerCase();
    return (name === "robots" || name === "googlebot") && content.split(/[\s,]+/).includes("noindex");
  });
}

/**
 * @param {string} html
 * @param {string} file
 * @returns {{ findings: Finding[], summary: PageSummary }}
 */
function inspectHtml(html, file) {
  /** @type {Finding[]} */
  const findings = [];
  const add = (rule, message) => findings.push({ file, rule, message });
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? visibleText(titleMatch[1]) : null;
  const canonicals = canonicalLinks(html);
  const canonical = canonicals.length === 1 ? canonicals[0] : null;

  if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(html)) add("html-lang", "Missing a non-empty html[lang] attribute.");
  if (!title || title.length < 3) add("title", "Missing or empty title element.");
  if (!/<meta\b(?=[^>]*\bname=["']description["'])(?=[^>]*\bcontent=["'][^"']{20,}["'])[^>]*>/i.test(html)) {
    add("description", "Missing or too-short meta description.");
  }
  if (canonicals.length !== 1) {
    add("canonical-count", `Expected exactly one canonical link, found ${canonicals.length}.`);
  } else {
    try {
      const url = new URL(canonicals[0]);
      if (!/^https?:$/.test(url.protocol)) add("canonical-protocol", "Canonical URL must use http or https.");
      if (url.search || url.hash) add("canonical-clean", "Canonical URL must not contain a query string or fragment.");
    } catch {
      add("canonical-absolute", "Canonical URL must be an absolute URL.");
    }
  }
  if (!/<h1\b[^>]*>[\s\S]*?\S[\s\S]*?<\/h1>/i.test(html)) add("h1", "Missing non-empty H1.");
  if (!/<a\b[^>]*\bhref=["'][^"']+["']/i.test(html)) add("crawlable-links", "No crawlable anchor with href found.");

  const text = visibleText(html);
  if (text.length < 120) add("primary-content", `Only ${text.length} visible text characters found; page may be a client-rendered shell.`);

  const images = html.match(/<img\b[^>]*>/gi) ?? [];
  if (images.some((image) => !/\balt=["'][^"']*["']/i.test(image))) add("image-alt", "An img element is missing an alt attribute.");
  if (/\b(lorem ipsum|todo:|replace me|example product)\b/i.test(text)) add("placeholder", "Placeholder content appears in visible page text.");

  return { findings, summary: { title, canonical, noindex: hasNoindex(html) } };
}

/** @param {string} path @returns {Promise<boolean>} */
async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

/** @param {string} manifestPath @returns {Promise<string[]>} */
async function readRoutes(manifestPath) {
  const parsed = JSON.parse(await readFile(manifestPath, "utf8"));
  const routes = Array.isArray(parsed)
    ? parsed
    : typeof parsed === "object" && parsed !== null && "routes" in parsed
      ? parsed.routes
      : null;
  if (!Array.isArray(routes) || !routes.every((item) => typeof item === "string")) {
    throw new Error("Route manifest must be a string array or an object with a string routes array.");
  }
  if (routes.length === 0) throw new Error("Route manifest must not be empty.");
  return routes;
}

/** @param {string} value @returns {string} */
function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/** @param {string} xml @returns {string[]} */
function sitemapLocations(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => decodeXml(match[1].trim()));
}

/** @param {string} value @returns {string | null} */
function normalizedAbsoluteUrl(value) {
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol) || url.search || url.hash) return null;
    url.pathname = normalizePathname(url.pathname);
    return url.href;
  } catch {
    return null;
  }
}

/** @type {Finding[]} */
const findings = [];

try {
  if (!(await stat(outputDir)).isDirectory()) throw new Error(`Not a directory: ${outputDir}`);

  const routes = await readRoutes(routeManifestPath);
  const duplicateRoutes = routes.filter((route, index) => routes.indexOf(route) !== index);
  /** @type {Set<string>} */
  const invalidRoutes = new Set();
  for (const route of new Set(duplicateRoutes)) {
    findings.push({ file: routeManifestPath, rule: "route-duplicate", message: `Duplicate route: ${route}` });
  }
  for (const route of routes) {
    if (
      !route.startsWith("/") ||
      route.includes("//") ||
      route.includes("?") ||
      route.includes("#") ||
      route.includes("\\") ||
      route.split("/").includes("..")
    ) {
      invalidRoutes.add(route);
      findings.push({ file: routeManifestPath, rule: "route-format", message: `Route must be a root-relative clean pathname: ${route}` });
    }
  }

  const files = await walk(outputDir);
  const htmlFiles = files.filter((file) => file.endsWith(".html"));
  if (htmlFiles.length === 0) findings.push({ file: outputDir, rule: "html-files", message: "No HTML files found." });

  /** @type {Map<string, PageSummary>} */
  const summaries = new Map();
  for (const file of htmlFiles) {
    const result = inspectHtml(await readFile(file, "utf8"), relative(outputDir, file));
    findings.push(...result.findings);
    summaries.set(file, result.summary);
  }

  for (const required of ["robots.txt", "sitemap.xml", "404.html"]) {
    if (!(await isFile(join(outputDir, required)))) findings.push({ file: required, rule: "required-file", message: `${required} is missing.` });
  }

  /** @type {{ route: string, file: string, summary: PageSummary }[]} */
  const routePages = [];
  for (const route of routes) {
    // Never resolve a malformed manifest entry against the filesystem.
    if (invalidRoutes.has(route)) continue;
    const candidates = routeCandidates(route);
    const matchFlags = await Promise.all(candidates.map(isFile));
    const matchIndex = matchFlags.findIndex(Boolean);
    if (matchIndex < 0) {
      findings.push({
        file: route,
        rule: "route-output",
        message: `No static HTML found. Expected one of: ${candidates.map((candidate) => relative(outputDir, candidate)).join(", ")}`,
      });
      continue;
    }
    const file = candidates[matchIndex];
    const summary = summaries.get(file);
    if (!summary) throw new Error(`Internal validation error: missing HTML summary for ${file}`);
    routePages.push({ route, file, summary });
  }

  const routedHtml = new Set(routePages.map((page) => page.file));
  for (const file of htmlFiles) {
    if (file === join(outputDir, "404.html")) continue;
    if (!routedHtml.has(file)) {
      findings.push({
        file: relative(outputDir, file),
        rule: "html-orphan",
        message: "Generated HTML is missing from the route manifest.",
      });
    }
  }

  /** @type {Map<string, string>} */
  const titles = new Map();
  /** @type {Map<string, string>} */
  const canonicals = new Map();
  /** @type {Set<string>} */
  const indexableCanonicals = new Set();
  /** @type {Set<string>} */
  const canonicalOrigins = new Set();

  for (const page of routePages) {
    const { route, summary } = page;
    if (summary.canonical) {
      const normalizedCanonical = normalizedAbsoluteUrl(summary.canonical);
      if (normalizedCanonical) {
        const canonicalUrl = new URL(normalizedCanonical);
        if (!summary.noindex) canonicalOrigins.add(canonicalUrl.origin);
        if (normalizePathname(canonicalUrl.pathname) !== normalizePathname(route)) {
          findings.push({ file: route, rule: "canonical-route", message: `Canonical path ${canonicalUrl.pathname} does not match route ${route}.` });
        }
        if (!summary.noindex) {
          const existingCanonicalRoute = canonicals.get(normalizedCanonical);
          if (existingCanonicalRoute && existingCanonicalRoute !== route) {
            findings.push({ file: route, rule: "canonical-duplicate", message: `Canonical is also used by ${existingCanonicalRoute}: ${normalizedCanonical}` });
          } else {
            canonicals.set(normalizedCanonical, route);
          }
          indexableCanonicals.add(normalizedCanonical);
        }
      }
    }
    if (!summary.noindex && summary.title) {
      const key = summary.title.toLocaleLowerCase().replace(/\s+/g, " ").trim();
      const existingTitleRoute = titles.get(key);
      if (existingTitleRoute && existingTitleRoute !== route) {
        findings.push({ file: route, rule: "title-duplicate", message: `Title is also used by ${existingTitleRoute}: ${summary.title}` });
      } else {
        titles.set(key, route);
      }
    }
  }

  if (canonicalOrigins.size > 1) {
    findings.push({
      file: routeManifestPath,
      rule: "canonical-origin",
      message: `Indexable canonicals use multiple origins: ${[...canonicalOrigins].join(", ")}`,
    });
  }

  const sitemapPath = join(outputDir, "sitemap.xml");
  if (await isFile(sitemapPath)) {
    const locations = sitemapLocations(await readFile(sitemapPath, "utf8"));
    if (locations.length === 0) findings.push({ file: "sitemap.xml", rule: "sitemap-empty", message: "Sitemap contains no <loc> URLs." });
    /** @type {Set<string>} */
    const sitemapUrls = new Set();
    for (const location of locations) {
      const normalized = normalizedAbsoluteUrl(location);
      if (!normalized) {
        findings.push({ file: "sitemap.xml", rule: "sitemap-url", message: `Sitemap URL must be absolute and contain no query or fragment: ${location}` });
        continue;
      }
      if (sitemapUrls.has(normalized)) findings.push({ file: "sitemap.xml", rule: "sitemap-duplicate", message: `Duplicate URL: ${normalized}` });
      sitemapUrls.add(normalized);
      if (!indexableCanonicals.has(normalized)) {
        findings.push({ file: "sitemap.xml", rule: "sitemap-unexpected", message: `URL is not an indexable generated canonical: ${normalized}` });
      }
    }
    for (const canonical of indexableCanonicals) {
      if (!sitemapUrls.has(canonical)) findings.push({ file: "sitemap.xml", rule: "sitemap-missing", message: `Indexable canonical is missing from sitemap: ${canonical}` });
    }
  }

  const robotsPath = join(outputDir, "robots.txt");
  if (await isFile(robotsPath)) {
    const robots = await readFile(robotsPath, "utf8");
    if (!/^\s*sitemap:\s*https?:\/\/\S+\s*$/im.test(robots)) {
      findings.push({ file: "robots.txt", rule: "robots-sitemap", message: "robots.txt must reference an absolute sitemap URL." });
    }
  }

  const report = {
    outputDir,
    routeManifest: routeManifestPath,
    routes: routes.length,
    htmlFiles: htmlFiles.length,
    indexablePages: indexableCanonicals.size,
    passed: findings.length === 0,
    findings,
  };

  if (jsonOutput) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } else if (report.passed) {
    process.stdout.write(`PASS: ${report.routes} routes and ${report.htmlFiles} HTML files validated in ${outputDir}.\n`);
  } else {
    process.stderr.write(`FAIL: ${findings.length} static-output findings.\n`);
    for (const finding of findings) process.stderr.write(`- [${finding.rule}] ${finding.file}: ${finding.message}\n`);
  }
  process.exit(report.passed ? 0 : 1);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (jsonOutput) {
    process.stdout.write(`${JSON.stringify({ outputDir, routeManifest: routeManifestPath, passed: false, error: message }, null, 2)}\n`);
  } else {
    process.stderr.write(`ERROR: ${message}\n`);
  }
  process.exit(2);
}

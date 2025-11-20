#!/usr/bin/env bun
import { readdirSync, statSync, readFileSync } from "fs";
import { join, extname } from "path";
import chalk from "chalk";

const supported = new Set([".js", ".ts", ".html", ".css"]);

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function scanJS(file: string, text: string) {
  const problems: string[] = [];

  if (/async\s+function|await/.test(text)) {
    problems.push(
      chalk.yellow(
        `• Uses async/await → Kindle WebBrowser JS engine is old; consider callbacks or Promises without async keywords.`,
      ),
    );
  }

  if (/=>/.test(text)) {
    problems.push(
      chalk.yellow(
        `• Arrow functions detected → Older WebKit on Kindle may choke; rewrite as function(){}`,
      ),
    );
  }

  if (/fetch\(/.test(text)) {
    problems.push(
      chalk.yellow(
        `• fetch() used → Kindle may not support fetch; consider XHR fallback.`,
      ),
    );
  }

  return problems;
}

function scanCSS(file: string, text: string) {
  const problems: string[] = [];

  if (/flex|grid/.test(text)) {
    problems.push(
      chalk.yellow(
        `• Modern layout (flex/grid) → Kindle's browser barely supports them; consider floats or table layouts.`,
      ),
    );
  }

  if (/var\(--/.test(text)) {
    problems.push(
      chalk.yellow(
        `• CSS variables → Unsupported; replace with static values.`,
      ),
    );
  }

  return problems;
}

function scanHTML(file: string, text: string) {
  const problems: string[] = [];

  if (/<video|<audio/.test(text)) {
    problems.push(
      chalk.yellow(
        `• Media elements → Kindle can't play them; remove or provide text-only fallback.`,
      ),
    );
  }

  if (/viewport/.test(text) && /initial-scale/.test(text)) {
    problems.push(
      chalk.yellow(
        `• Viewport meta may not behave correctly on Kindle → Expect weird zoom behavior.`,
      ),
    );
  }

  return problems;
}

function scanTS(file: string, text: string) {
  return scanJS(file, text); // TS compiles to JS, same issues apply
}

function scanFile(file: string) {
  const ext = extname(file);
  if (!supported.has(ext)) return;

  const text = readFileSync(file, "utf8");
  let problems: string[] = [];

  if (ext === ".js") problems = scanJS(file, text);
  if (ext === ".ts") problems = scanTS(file, text);
  if (ext === ".css") problems = scanCSS(file, text);
  if (ext === ".html") problems = scanHTML(file, text);

  if (problems.length === 0) return;

  console.log(chalk.blue(`\nFile: ${file}`));
  for (const p of problems) console.log(p);
}

function main() {
  const target = Bun.argv[2];
  if (!target) {
    console.log(chalk.red("Please provide a file or directory."));
    process.exit(1);
  }

  let files: string[] = [];
  const st = statSync(target);

  if (st.isDirectory()) files = walk(target);
  else files = [target];

  console.log(
    chalk.magenta("Kindlefy — scanning for Kindle WebBrowser quirks..."),
  );

  for (const file of files) scanFile(file);

  console.log(chalk.green("\nScan complete."));
}

main();

// Kindle ColorSoft firmware support
export const kindleColorSoftVersions = {
  "ColorSoft 1.0": {
    webkit: "538.1",
    notes: "Early e-ink color WebKit variant",
  },
  "ColorSoft 1.2": {
    webkit: "538.3",
    notes: "Improved CSS handling and partial Grid",
  },
  "ColorSoft 2.0": {
    webkit: "540.0",
    notes: "Most capable; broader ES6 support",
  },
};

// Other Kindle model WebKit baselines
export const kindleModels = {
  "Kindle 4/5 (E-Ink)": {
    webkit: "534.x",
    notes: "Ancient WebKit; barely supports modern JS; no flexbox.",
  },
  "Kindle Paperwhite 1": {
    webkit: "534.x",
    notes: "Same era as Kindle 5; JS support extremely limited.",
  },
  "Kindle Paperwhite 2": {
    webkit: "537.x",
    notes: "Slightly newer; still pre-flexbox and missing many ES5 features.",
  },
  "Kindle Paperwhite 3": {
    webkit: "537.x",
    notes: "Marginal improvements; still no CSS variables or flexbox.",
  },
  "Kindle Paperwhite 4": {
    webkit: "538.x",
    notes: "Better CSS parsing; some ES6 works but inconsistently.",
  },
  "Kindle Oasis (all gens)": {
    webkit: "538–539 range",
    notes: "Fastest pre-color Kindles; partial flexbox but buggy; no fetch().",
  },
  "Kindle Scribe": {
    webkit: "539–540 range",
    notes:
      "Closest to ColorSoft 2.0; best JS support in any monochrome Kindle.",
  },
};

import { build } from "esbuild";
import { builtinModules } from "node:module";
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const isDeploy = process.argv.includes("--deploy");
const vaultArgument = process.argv.find((argument) => argument.startsWith("--vault="));
const vaultRoot = vaultArgument?.slice("--vault=".length) || process.env.OBSIDIAN_VAULT;

if (isDeploy && !vaultRoot) {
  throw new Error("Set OBSIDIAN_VAULT or pass --vault=<vault-directory> before running the deploy script.");
}

const outputRoot = isDeploy
  ? join(vaultRoot, ".obsidian", "plugins", "goodcharts")
  : projectRoot;

await mkdir(outputRoot, { recursive: true });

await build({
  entryPoints: [join(projectRoot, "src", "main.tsx")],
  outfile: join(outputRoot, "main.js"),
  bundle: true,
  external: ["obsidian", "electron", "@codemirror/*", ...builtinModules],
  format: "cjs",
  platform: "browser",
  target: "es2022",
  jsx: "automatic",
  jsxImportSource: "preact",
  sourcemap: "inline",
  logLevel: "info",
});

if (isDeploy) {
  await Promise.all([
    copyFile(join(projectRoot, "manifest.json"), join(outputRoot, "manifest.json")),
    copyFile(join(projectRoot, "styles.css"), join(outputRoot, "styles.css")),
  ]);
}

console.log(`${isDeploy ? "Deployed" : "Built"} GoodCharts to ${outputRoot}`);

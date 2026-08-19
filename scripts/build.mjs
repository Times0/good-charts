import { build } from "esbuild";
import { builtinModules } from "node:module";
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const prototypeRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const vaultRoot = process.env.OBSIDIAN_VAULT ?? "C:\\Users\\spoto\\Documents\\BigVault";
const pluginRoot = join(vaultRoot, ".obsidian", "plugins", "tanstack-charts");

await mkdir(pluginRoot, { recursive: true });

await build({
  entryPoints: [join(prototypeRoot, "src", "main.tsx")],
  outfile: join(pluginRoot, "main.js"),
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

await Promise.all([
  copyFile(join(prototypeRoot, "manifest.json"), join(pluginRoot, "manifest.json")),
  copyFile(join(prototypeRoot, "styles.css"), join(pluginRoot, "styles.css")),
]);

console.log(`Deployed TanStack Charts to ${pluginRoot}`);

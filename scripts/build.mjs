import { build } from "esbuild";
import { cpSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const out = ".output";
rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "server"), { recursive: true });
mkdirSync(join(out, "node_modules"), { recursive: true });

await build({
  entryPoints: ["server.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: join(out, "server/index.mjs"),
  external: [
    "@oxc-resolver/binding-linux-x64-gnu",
    "@oxc-resolver/binding-linux-x64-musl",
    "lightningcss",
  ],
  banner: {
    js: `import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);`,
  },
});

function copyIfExists(src, dest) {
  if (existsSync(src)) cpSync(src, dest, { recursive: true });
}

copyIfExists("public", join(out, "public"));
copyIfExists("node_modules/@oxc-resolver", join(out, "node_modules/@oxc-resolver"));
copyIfExists("node_modules/oxc-resolver", join(out, "node_modules/oxc-resolver"));
copyIfExists("node_modules/lightningcss", join(out, "node_modules/lightningcss"));
copyIfExists(
  "node_modules/lightningcss-linux-x64-gnu",
  join(out, "node_modules/lightningcss-linux-x64-gnu"),
);
// Drop musl bindings to keep the artifact small
rmSync(join(out, "node_modules/@oxc-resolver/binding-linux-x64-musl"), {
  recursive: true,
  force: true,
});

console.log("Built", out);

/**
 * Build a slim .output/ suitable for Prisma Compute (Bun runtime, ~256MB artifact cap).
 * Does NOT commit node_modules — run before `bun run deploy`.
 *
 * Recipe that succeeded in QA:
 * - app source + public + tsconfig + server.ts (NODE_ENV default production)
 * - package.json with root dependencies mirrored (Composer lives in root
 *   devDependencies so it is not included); bun/npm install inside .output
 * - keep musl + gnu native bindings
 * - React JSX shim re-exporting remix/component runtimes (Bun ignored jsxImportSource)
 * - bunfig.toml jsxImportSource remix/component
 */
import {
  cpSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  existsSync,
  readFileSync,
} from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const out = ".output";
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

for (const p of ["app", "public", "tsconfig.json"]) {
  if (existsSync(p)) cpSync(p, join(out, p), { recursive: true });
}

const serverSrc = readFileSync("server.ts", "utf8");
const serverOut = serverSrc.includes("process.env.NODE_ENV = 'production'")
  ? serverSrc
  : `if (!process.env.NODE_ENV) {\n  process.env.NODE_ENV = 'production'\n}\n\n${serverSrc}`;
writeFileSync(join(out, "server.ts"), serverOut);

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
writeFileSync(
  join(out, "package.json"),
  JSON.stringify(
    {
      name: "qa-remix-v3",
      private: true,
      type: "module",
      engines: { node: ">=24.3.0" },
      dependencies: pkg.dependencies || {},
    },
    null,
    2,
  ) + "\n",
);

writeFileSync(
  join(out, "bunfig.toml"),
  `jsx = "react-jsx"\njsxImportSource = "remix/component"\n`,
);

const install = spawnSync("bun", ["install"], {
  cwd: out,
  stdio: "inherit",
  env: process.env,
});
if (install.status !== 0) {
  const npm = spawnSync("npm", ["install", "--omit=dev"], {
    cwd: out,
    stdio: "inherit",
    env: process.env,
  });
  if (npm.status !== 0) process.exit(npm.status ?? 1);
}

// React JSX shim — Bun may ignore jsxImportSource and resolve react/jsx-*
const reactDir = join(out, "node_modules", "react");
mkdirSync(reactDir, { recursive: true });
writeFileSync(
  join(reactDir, "package.json"),
  JSON.stringify(
    {
      name: "react",
      version: "0.0.0-shim",
      type: "module",
      exports: {
        "./jsx-runtime": "./jsx-runtime.js",
        "./jsx-dev-runtime": "./jsx-dev-runtime.js",
        ".": "./index.js",
      },
    },
    null,
    2,
  ) + "\n",
);
writeFileSync(
  join(reactDir, "jsx-runtime.js"),
  `export * from "remix/component/jsx-runtime";\n`,
);
writeFileSync(
  join(reactDir, "jsx-dev-runtime.js"),
  `export * from "remix/component/jsx-dev-runtime";\n`,
);
writeFileSync(join(reactDir, "index.js"), `export default {};\n`);

console.log("Prepared", out, "— run: bun run deploy");
spawnSync("du", ["-sh", out], { stdio: "inherit" });

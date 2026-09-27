import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

function resolveResult(okPath) {
  return { path: okPath, error: undefined };
}

function fail(err) {
  return { path: undefined, error: String(err?.message ?? err) };
}

function resolveFrom(directoryOrFile, request, asFile) {
  const baseDir = asFile ? path.dirname(directoryOrFile) : directoryOrFile;
  try {
    const req = createRequire(path.join(baseDir, "package.json"));
    return resolveResult(req.resolve(request));
  } catch (e1) {
    try {
      const req = createRequire(pathToFileURL(path.join(baseDir, "index.js")).href);
      return resolveResult(req.resolve(request));
    } catch (e2) {
      return fail(e2);
    }
  }
}

export class ResolverFactory {
  constructor(_options) {}
  static default() {
    return new ResolverFactory();
  }
  cloneWithOptions(options) {
    return new ResolverFactory(options);
  }
  clearCache() {}
  sync(directory, request) {
    return resolveFrom(directory, request, false);
  }
  async(directory, request) {
    return Promise.resolve(this.sync(directory, request));
  }
  resolveFileSync(file, request) {
    return resolveFrom(file, request, true);
  }
  resolveFileAsync(file, request) {
    return Promise.resolve(this.resolveFileSync(file, request));
  }
  resolveDtsSync(file, request) {
    return this.resolveFileSync(file, request);
  }
  resolveDtsAsync(file, request) {
    return this.resolveFileAsync(file, request);
  }
}

export function sync(directory, request) {
  return new ResolverFactory().sync(directory, request);
}

export default { ResolverFactory, sync };

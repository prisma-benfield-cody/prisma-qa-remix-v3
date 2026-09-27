export function transform(opts = {}) {
  const code = opts.code ?? Buffer.alloc(0);
  return { code: typeof code === "string" ? Buffer.from(code) : code, map: null };
}
export default { transform };
